// ─── Delivery Module Types ───

export interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  coordinates: { lat: number; lng: number };
  status: 'assign' | 'en-route' | 'delivered';
  assignedDriverId: string | null;
  duration: string;
  timeOrdered: string;
  items: string[];
  total: number;
  route?: { lat: number; lng: number }[];
}

export interface Vehicle {
  id: string;
  number: string;
  label: string;
  isAssigned: boolean;
  assignedDriverId: string | null;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  status: 'available' | 'on-delivery' | 'returning' | 'offline';
  currentLocation: { lat: number; lng: number };
  color: string;
  activeOrders: string[];
  assignedVehicle: Vehicle | null;
  routeIndex?: number; // Index of the current point the driver is moving towards
}

export interface RestaurantLocation {
  name: string;
  coordinates: { lat: number; lng: number };
}
