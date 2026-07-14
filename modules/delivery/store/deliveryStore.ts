import { create } from "zustand";
import {
  DeliveryOrder,
  Driver,
  Vehicle,
  RestaurantLocation,
} from "../types/delivery";
import {
  dummyOrders,
  dummyDrivers,
  dummyVehicles,
  restaurantLocation as defaultRestaurant,
} from "../data/dummyData";

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
  assignDriver: (orderId: string, driverId: string) => void;
  markDelivered: (orderId: string) => void;
  assignVehicle: (driverId: string, vehicleId: string) => void;
  unassignVehicle: (driverId: string) => void;
  openVehicleModal: (driverId: string) => void;
  closeVehicleModal: () => void;
  simulateDriverMovement: () => void;
}

export const useDeliveryStore = create<DeliveryState>((set, get) => ({
  // ── Initial Data ──
  orders: dummyOrders,
  drivers: dummyDrivers,
  vehicles: dummyVehicles,
  restaurantLocation: defaultRestaurant,

  // ── UI State ──
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

  // ── Actions ──
  setActiveTab: (tab) => set({ activeTab: tab }),

  setActiveFilter: (filter) => set({ activeFilter: filter }),

  setCarrierFilter: (filter) => set({ carrierFilter: filter }),

  selectOrder: (orderId) => set({ selectedOrderId: orderId }),

  selectDriver: (driverId) => set({ selectedDriverId: driverId }),

  assignDriver: (orderId, driverId) => {
    set((state) => {
      const driver = state.drivers.find((d) => d.id === driverId);
      if (!driver || !driver.assignedVehicle) return state;

      const order = state.orders.find((o) => o.id === orderId);
      const startLoc =
        order?.route && order.route.length > 0
          ? order.route[0]
          : state.restaurantLocation.coordinates;

      const updatedOrders = state.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "en-route" as const,
              assignedDriverId: driverId,
            }
          : order,
      );

      const updatedDrivers = state.drivers.map((d) =>
        d.id === driverId
          ? {
              ...d,
              status: "on-delivery" as const,
              activeOrders: [...d.activeOrders, orderId],
              currentLocation: startLoc,
              routeIndex: 0,
            }
          : d,
      );

      return { orders: updatedOrders, drivers: updatedDrivers };
    });
  },

  markDelivered: (orderId) => {
    set((state) => {
      const order = state.orders.find((o) => o.id === orderId);
      if (!order) return state;

      const updatedOrders = state.orders.map((o) =>
        o.id === orderId ? { ...o, status: "delivered" as const } : o,
      );

      const updatedDrivers = state.drivers.map((d) => {
        if (d.id === order.assignedDriverId) {
          const newActiveOrders = d.activeOrders.filter((id) => id !== orderId);
          return {
            ...d,
            activeOrders: newActiveOrders,
            status:
              newActiveOrders.length === 0 ? ("returning" as const) : d.status,
          };
        }
        return d;
      });

      return { orders: updatedOrders, drivers: updatedDrivers };
    });
  },

  assignVehicle: (driverId, vehicleId) => {
    set((state) => {
      const vehicle = state.vehicles.find((v) => v.id === vehicleId);
      if (!vehicle || vehicle.isAssigned) return state;

      const updatedVehicles = state.vehicles.map((v) =>
        v.id === vehicleId
          ? { ...v, isAssigned: true, assignedDriverId: driverId }
          : v,
      );

      const assignedVehicle = {
        ...vehicle,
        isAssigned: true,
        assignedDriverId: driverId,
      };
      const updatedDrivers = state.drivers.map((d) =>
        d.id === driverId ? { ...d, assignedVehicle } : d,
      );

      return {
        vehicles: updatedVehicles,
        drivers: updatedDrivers,
        vehicleModalOpen: false,
        selectedDriverId: null,
      };
    });
  },

  unassignVehicle: (driverId) => {
    set((state) => {
      const driver = state.drivers.find((d) => d.id === driverId);
      if (!driver || !driver.assignedVehicle) return state;

      const updatedVehicles = state.vehicles.map((v) =>
        v.id === driver.assignedVehicle!.id
          ? { ...v, isAssigned: false, assignedDriverId: null }
          : v,
      );

      const updatedDrivers = state.drivers.map((d) =>
        d.id === driverId ? { ...d, assignedVehicle: null } : d,
      );

      return { vehicles: updatedVehicles, drivers: updatedDrivers };
    });
  },

  openVehicleModal: (driverId) =>
    set({ vehicleModalOpen: true, selectedDriverId: driverId }),

  closeVehicleModal: () =>
    set({ vehicleModalOpen: false, selectedDriverId: null }),

  simulateDriverMovement: () => {
    set((state) => {
      const updatedDrivers = state.drivers.map((driver) => {
        // Case 1: Driver is returning to the restaurant after delivery
        if (driver.status === "returning") {
          const target = state.restaurantLocation.coordinates;
          const current = driver.currentLocation;

          const distLat = target.lat - current.lat;
          const distLng = target.lng - current.lng;
          const distance = Math.sqrt(distLat * distLat + distLng * distLng);

          // If very close to restaurant, mark as available and stop moving
          if (distance < 0.0003) {
            return {
              ...driver,
              status: "available" as const,
              currentLocation: target,
              routeIndex: undefined,
            };
          }

          // Calculate step increment towards restaurant
          const stepSize = 0.0004; // Slightly faster return speed
          let nextLat = current.lat;
          let nextLng = current.lng;

          if (distance > 0) {
            nextLat += (distLat / distance) * Math.min(stepSize, distance);
            nextLng += (distLng / distance) * Math.min(stepSize, distance);
          }

          return {
            ...driver,
            currentLocation: { lat: nextLat, lng: nextLng },
          };
        }

        // Case 2: Driver is on delivery moving towards customer
        if (driver.status === "on-delivery" && driver.activeOrders.length > 0) {
          const activeOrder = state.orders.find(
            (o) => o.id === driver.activeOrders[0] && o.status === "en-route",
          );
          if (
            !activeOrder ||
            !activeOrder.route ||
            activeOrder.route.length === 0
          )
            return driver;

          const route = activeOrder.route;
          const currentIdx = driver.routeIndex ?? 0;
          const target = route[currentIdx];
          const current = driver.currentLocation;

          const distLat = target.lat - current.lat;
          const distLng = target.lng - current.lng;
          const distance = Math.sqrt(distLat * distLat + distLng * distLng);

          // If very close to current waypoint, advance to next waypoint
          let nextIdx = currentIdx;
          if (distance < 0.0003 && currentIdx < route.length - 1) {
            nextIdx = currentIdx + 1;
          }

          // Calculate step increment towards waypoint
          const stepSize = 0.0003; // movement speed per simulation tick
          let nextLat = current.lat;
          let nextLng = current.lng;

          if (distance > 0) {
            nextLat += (distLat / distance) * Math.min(stepSize, distance);
            nextLng += (distLng / distance) * Math.min(stepSize, distance);
          }

          return {
            ...driver,
            currentLocation: { lat: nextLat, lng: nextLng },
            routeIndex: nextIdx,
          };
        }

        return driver;
      });

      return { drivers: updatedDrivers };
    });
  },
}));
