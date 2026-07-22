import { create } from "zustand";
import axios from "axios";
import { getPusherClient } from "../../../lib/pusher";
import {
  DeliveryOrder,
  Driver,
  Vehicle,
  RestaurantLocation,
} from "../types/delivery";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const DEFAULT_RESTAURANT_COORDS = { lat: 22.1818, lng: 78.7618 };

interface DeliveryState {
  // ── Data ──
  orders: DeliveryOrder[];
  drivers: Driver[];
  vehicles: Vehicle[];
  restaurantLocation: RestaurantLocation;

  // ── UI State ──
  activeTab: "orders" | "carriers" | "ta";
  activeFilter: "assign" | "en-route" | "delivered";
  carrierFilter: "available" | "en-route";
  selectedOrderId: string | null;
  selectedDriverId: string | null;
  vehicleModalOpen: boolean;

  // ── Computed Helpers ──
  getFilteredOrders: () => DeliveryOrder[];
  getFilteredDrivers: () => Driver[];
  getOrderCounts: () => { assign: number; enRoute: number; delivered: number };
  getCarrierCounts: () => { available: number; enRoute: number };
  getDriversWithVehicles: () => Driver[];

  // ── Actions ──
  setActiveTab: (tab: "orders" | "carriers" | "ta") => void;
  setActiveFilter: (filter: "assign" | "en-route" | "delivered") => void;
  setCarrierFilter: (filter: "available" | "en-route") => void;
  selectOrder: (orderId: string | null) => void;
  selectDriver: (driverId: string | null) => void;
  openVehicleModal: (driverId: string) => void;
  closeVehicleModal: () => void;
  setRestaurantLocation: (coords: { lat: number; lng: number }) => void;

  // ── API Actions ──
  fetchOrders: () => Promise<void>;
  fetchDrivers: () => Promise<void>;
  fetchVehicles: () => Promise<void>;
  assignDriver: (orderId: string, driverId: string) => Promise<void>;
  unassignDriver: (orderId: string) => Promise<void>;
  markDelivered: (orderId: string) => Promise<void>;
  assignVehicle: (driverId: string, vehicleId: string) => Promise<void>;
  unassignVehicle: (driverId: string) => Promise<void>;
  markDriverAvailable: (driverId: string) => Promise<void>;
  addVehicle: (number: string, label: string) => Promise<void>;
  updateVehicle: (id: string, number: string, label: string) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;

  // ── Real-Time Pusher Actions ──
  initPusher: () => void;
  cleanupPusher: () => void;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  // ── Initial State ──
  orders: [],
  drivers: [],
  vehicles: [],
  restaurantLocation: {
    name: "Chicken Delight",
    coordinates: DEFAULT_RESTAURANT_COORDS,
  },
  activeTab: "orders",
  activeFilter: "assign",
  carrierFilter: "available",
  selectedOrderId: null,
  selectedDriverId: null,
  vehicleModalOpen: false,

  // ── Computed Helpers ──
  getFilteredOrders: () => {
    const { orders, activeFilter } = get();
    return orders.filter((o) => o.status === activeFilter);
  },

  getFilteredDrivers: () => {
    const { drivers, carrierFilter } = get();
    if (carrierFilter === "available") {
      return drivers.filter((d) => d.status === "available");
    }
    return drivers.filter(
      (d) => d.status === "on-delivery" || d.status === "returning",
    );
  },

  getOrderCounts: () => {
    const { orders } = get();
    return {
      assign: orders.filter((o) => o.status === "assign").length,
      enRoute: orders.filter((o) => o.status === "en-route").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    };
  },

  getCarrierCounts: () => {
    const { drivers } = get();
    return {
      available: drivers.filter((d) => d.status === "available").length,
      enRoute: drivers.filter(
        (d) => d.status === "on-delivery" || d.status === "returning",
      ).length,
    };
  },

  getDriversWithVehicles: () => {
    const { drivers } = get();
    return drivers.filter(
      (d) => d.assignedVehicle !== null && d.status !== "offline",
    );
  },

  // ── Local UI State Actions ──
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
  setCarrierFilter: (filter) => set({ carrierFilter: filter }),
  selectOrder: (orderId) => set({ selectedOrderId: orderId }),
  selectDriver: (driverId) => set({ selectedDriverId: driverId }),
  openVehicleModal: (driverId) => set({ vehicleModalOpen: true, selectedDriverId: driverId }),
  closeVehicleModal: () => set({ vehicleModalOpen: false, selectedDriverId: null }),
  setRestaurantLocation: (coords) => set((state) => ({ restaurantLocation: { ...state.restaurantLocation, coordinates: coords } })),

  // ── API Actions ──
  fetchOrders: async () => {
    try {
      const res = await axios.get(`${API_URL}/delivery/orders`);
      if (res.data.success) {
        // Map backend properties if needed (backend matches frontend mostly)
        const mappedOrders = res.data.data.map((o: any) => ({
          ...o,
          id: o._id, // map Mongo _id to id
          coordinates: o.coordinates?.lat ? o.coordinates : DEFAULT_RESTAURANT_COORDS,
        }));
        set({ orders: mappedOrders });
      }
    } catch (err) {
      console.error("Error fetching delivery orders:", err);
    }
  },

  fetchDrivers: async () => {
    try {
      const res = await axios.get(`${API_URL}/delivery/drivers`);
      if (res.data.success) {
        const mappedDrivers = res.data.data.map((d: any) => ({
          ...d,
          id: d._id,
          currentLocation: d.currentLocation?.lat ? d.currentLocation : null,
        }));
        set({ drivers: mappedDrivers });
      }
    } catch (err) {
      console.error("Error fetching drivers:", err);
    }
  },

  fetchVehicles: async () => {
    try {
      const res = await axios.get(`${API_URL}/delivery/vehicles`);
      if (res.data.success) {
        const mappedVehicles = res.data.data.map((v: any) => ({
          ...v,
          id: v._id,
        }));
        set({ vehicles: mappedVehicles });
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    }
  },

  assignDriver: async (orderId, driverId) => {
    try {
      const res = await axios.post(`${API_URL}/delivery/assign`, {
        orderId,
        driverId,
      });
      if (res.data.success) {
        // Re-fetch to sync state across dashboard
        await Promise.all([get().fetchOrders(), get().fetchDrivers()]);
      }
    } catch (err) {
      console.error("Error assigning driver:", err);
    }
  },

  unassignDriver: async (orderId) => {
    try {
      const res = await axios.post(`${API_URL}/delivery/unassign`, {
        orderId,
      });
      if (res.data.success) {
        await Promise.all([get().fetchOrders(), get().fetchDrivers()]);
      }
    } catch (err) {
      console.error("Error unassigning driver:", err);
    }
  },

  markDelivered: async (orderId) => {
    try {
      // Find assignment for this order first
      const resTrack = await axios.get(`${API_URL}/delivery/track/${orderId}`);
      if (resTrack.data.success && resTrack.data.data.assigned) {
        const assignmentId = resTrack.data.data.assignmentId;
        const resDeliver = await axios.patch(`${API_URL}/delivery/driver/deliver/${assignmentId}`);
        if (resDeliver.data.success) {
          await Promise.all([get().fetchOrders(), get().fetchDrivers()]);
        }
      }
    } catch (err) {
      console.error("Error marking delivery delivered:", err);
    }
  },

  assignVehicle: async (driverId, vehicleId) => {
    try {
      const res = await axios.post(`${API_URL}/delivery/vehicles/assign`, {
        driverId,
        vehicleId,
      });
      if (res.data.success) {
        await Promise.all([get().fetchDrivers(), get().fetchVehicles()]);
        set({ vehicleModalOpen: false, selectedDriverId: null });
      }
    } catch (err) {
      console.error("Error assigning vehicle:", err);
    }
  },

  unassignVehicle: async (driverId) => {
    try {
      const res = await axios.delete(`${API_URL}/delivery/vehicles/unassign/${driverId}`);
      if (res.data.success) {
        await Promise.all([get().fetchDrivers(), get().fetchVehicles()]);
      }
    } catch (err) {
      console.error("Error unassigning vehicle:", err);
    }
  },

  addVehicle: async (number, label) => {
    try {
      const res = await axios.post(`${API_URL}/delivery/vehicles`, { number, label });
      if (res.data.success) {
        await get().fetchVehicles();
      }
    } catch (err) {
      console.error("Error adding vehicle:", err);
      throw err;
    }
  },

  updateVehicle: async (id, number, label) => {
    try {
      const res = await axios.put(`${API_URL}/delivery/vehicles/${id}`, { number, label });
      if (res.data.success) {
        await Promise.all([get().fetchVehicles(), get().fetchDrivers()]);
      }
    } catch (err) {
      console.error("Error updating vehicle:", err);
      throw err;
    }
  },

  deleteVehicle: async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/delivery/vehicles/${id}`);
      if (res.data.success) {
        await Promise.all([get().fetchVehicles(), get().fetchDrivers()]);
      }
    } catch (err) {
      console.error("Error deleting vehicle:", err);
      throw err;
    }
  },

  markDriverAvailable: async (driverId) => {
    try {
      const res = await axios.post(`${API_URL}/delivery/driver/${driverId}/complete-active`);
      if (res.data.success) {
        await Promise.all([get().fetchDrivers(), get().fetchOrders()]);
      }
    } catch (err) {
      console.error("Error marking driver available:", err);
    }
  },

  // ── Real-Time Pusher Actions ──
  initPusher: () => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe("private-restaurant-default");

    // 1. Listen for Pusher location events (both client events & server-relay fallback)
    const handleLocationUpdate = (data: any) => {
      const { driverId, lat, lng, bearing, speed } = data;
      set((state) => {
        const updatedDrivers = state.drivers.map((d) => {
          if (d.id === driverId || d._id === driverId) {
            return {
              ...d,
              currentLocation: { lat, lng },
              bearing,
              speed: speed || 0,
              lastEventTime: d.locationUpdatedAt || Date.now(),
              locationUpdatedAt: Date.now(),
            };
          }
          return d;
        });
        return { drivers: updatedDrivers };
      });
    };

    channel.bind("client-driver-location", handleLocationUpdate);

    // 2. Listen for Server-triggered assignment status events with optimistic state updates (Option B)
    channel.bind("delivery-assigned", (data: any) => {
      if (!data || !data.orderId) {
        get().fetchOrders();
        get().fetchDrivers();
        return;
      }

      set((state) => {
        const updatedOrders = state.orders.map((o) => {
          if (o.id === data.orderId || o._id === data.orderId) {
            if (data.unassigned) {
              return {
                ...o,
                status: "assign" as const,
                assignedDriverId: null,
                assignmentStatus: null,
              };
            }
            return {
              ...o,
              status: "en-route" as const,
              assignedDriverId: data.driverId || o.assignedDriverId,
              assignmentStatus: "assigned",
            };
          }
          return o;
        });

        const updatedDrivers = state.drivers.map((d) => {
          if (data.driverId && (d.id === data.driverId || d._id === data.driverId)) {
            if (data.unassigned) {
              const activeOrders = (d.activeOrders || []).filter(
                (oid) => oid !== data.orderId
              );
              return {
                ...d,
                activeOrders,
                status: activeOrders.length === 0 ? ("available" as const) : d.status,
              };
            }
            const activeOrders = Array.from(
              new Set([...(d.activeOrders || []), data.orderId])
            );
            return {
              ...d,
              status: "on-delivery" as const,
              activeOrders,
            };
          }
          return d;
        });

        return { orders: updatedOrders, drivers: updatedDrivers };
      });

      // Fallback: If order or driver was not present in local state, fetch from server
      const { orders, drivers } = get();
      const hasOrder = orders.some((o) => o.id === data.orderId || o._id === data.orderId);
      const hasDriver = data.driverId ? drivers.some((d) => d.id === data.driverId || d._id === data.driverId) : true;
      if (!hasOrder || !hasDriver) {
        get().fetchOrders();
        get().fetchDrivers();
      }
    });

    channel.bind("delivery-status-update", (data: any) => {
      if (!data || !data.orderId) {
        get().fetchOrders();
        get().fetchDrivers();
        return;
      }

      set((state) => {
        const updatedOrders = state.orders.map((o) => {
          if (o.id === data.orderId || o._id === data.orderId) {
            const isDeliveredOrCompleted =
              data.status === "delivered" || data.status === "completed";
            return {
              ...o,
              status: isDeliveredOrCompleted ? ("delivered" as const) : ("en-route" as const),
              assignmentStatus: data.status,
              deliveredAt: isDeliveredOrCompleted ? data.timestamp || new Date().toISOString() : o.deliveredAt,
            };
          }
          return o;
        });

        const updatedDrivers = state.drivers.map((d) => {
          if (data.driverId && (d.id === data.driverId || d._id === data.driverId)) {
            const activeOrders = (d.activeOrders || []).filter((oid) => oid !== data.orderId);
            let nextStatus = d.status;
            if (data.status === "delivered") {
              nextStatus = activeOrders.length === 0 ? "returning" : "on-delivery";
            } else if (data.status === "completed") {
              nextStatus = activeOrders.length === 0 ? "available" : "on-delivery";
            }
            return {
              ...d,
              activeOrders,
              status: nextStatus,
            };
          }
          return d;
        });

        return { orders: updatedOrders, drivers: updatedDrivers };
      });
    });

    channel.bind("driver-status-change", (data: any) => {
      if (!data || !data.driverId) {
        get().fetchDrivers();
        return;
      }

      set((state) => {
        const updatedDrivers = state.drivers.map((d) => {
          if (d.id === data.driverId || d._id === data.driverId) {
            return {
              ...d,
              status: data.status,
              activeOrders: data.status === "available" ? [] : d.activeOrders,
            };
          }
          return d;
        });
        return { drivers: updatedDrivers };
      });
    });
  },

  cleanupPusher: () => {
    const pusher = getPusherClient();
    pusher.unsubscribe("private-restaurant-default");
  },
}));
