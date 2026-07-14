import { DeliveryOrder, Driver, Vehicle, RestaurantLocation } from '../types/delivery';

// ─── Restaurant Location (Medicine Hat, AB) ───
export const restaurantLocation: RestaurantLocation = {
  name: 'Chicken Delight',
  coordinates: { lat: 50.0280, lng: -110.6770 },
};

// ─── Vehicles (12 numbered) ───
export const dummyVehicles: Vehicle[] = Array.from({ length: 12 }, (_, i) => ({
  id: `vehicle-${i + 1}`,
  number: `${i + 1}`,
  label: `Vehicle #${i + 1}`,
  isAssigned: i < 2, // first 2 vehicles assigned by default
  assignedDriverId: i === 0 ? 'driver-1' : i === 1 ? 'driver-2' : null,
}));

// ─── Drivers ───
export const dummyDrivers: Driver[] = [
  {
    id: 'driver-1',
    name: 'Alex Mercer',
    phone: '403-926-0190',
    status: 'on-delivery',
    currentLocation: { lat: 50.0280, lng: -110.6770 },
    color: '#3B82F6', // blue
    activeOrders: ['order-4'],
    assignedVehicle: dummyVehicles[0],
  },
  {
    id: 'driver-2',
    name: 'Marcus Vance',
    phone: '403-581-2200',
    status: 'available',
    currentLocation: { lat: 50.0280, lng: -110.6770 },
    color: '#F97316', // orange
    activeOrders: [],
    assignedVehicle: dummyVehicles[1],
  },
  {
    id: 'driver-3',
    name: 'Oliver Taylor',
    phone: '403-715-4488',
    status: 'available',
    currentLocation: { lat: 50.0280, lng: -110.6770 },
    color: '#8B5CF6', // purple
    activeOrders: [],
    assignedVehicle: null,
  },
];

// ─── Delivery Orders ───
export const dummyOrders: DeliveryOrder[] = [
  {
    id: 'order-1',
    orderNumber: 'CHK 101',
    customerName: 'John Smith',
    customerPhone: '403-555-0101',
    deliveryAddress: '122 Upland Dr SE, Medicine Hat',
    coordinates: { lat: 50.0370, lng: -110.6600 },
    status: 'assign',
    assignedDriverId: null,
    duration: '1 Min',
    timeOrdered: '10:39',
    items: ['2x Chicken Burger', '1x Fries', '1x Coke'],
    total: 28.50,
    route: [
      { lat: 50.0280, lng: -110.6770 },
      { lat: 50.0280, lng: -110.6690 },
      { lat: 50.0340, lng: -110.6690 },
      { lat: 50.0370, lng: -110.6600 }
    ]
  },
  {
    id: 'order-2',
    orderNumber: 'CHK 102',
    customerName: 'Emily Davis',
    customerPhone: '403-555-0102',
    deliveryAddress: '540 3rd St SE, Medicine Hat',
    coordinates: { lat: 50.0320, lng: -110.6720 },
    status: 'assign',
    assignedDriverId: null,
    duration: '5 Min',
    timeOrdered: '10:42',
    items: ['1x Family Bucket', '2x Gravy'],
    total: 45.99,
    route: [
      { lat: 50.0280, lng: -110.6770 },
      { lat: 50.0320, lng: -110.6770 },
      { lat: 50.0320, lng: -110.6720 }
    ]
  },
  {
    id: 'order-3',
    orderNumber: 'CHK 103',
    customerName: 'Mike Wilson',
    customerPhone: '403-555-0103',
    deliveryAddress: '880 2nd Ave NW, Medicine Hat',
    coordinates: { lat: 50.0430, lng: -110.6830 },
    status: 'assign',
    assignedDriverId: null,
    duration: '8 Min',
    timeOrdered: '10:45',
    items: ['3x Chicken Wings', '1x Caesar Salad'],
    total: 32.75,
    route: [
      { lat: 50.0280, lng: -110.6770 },
      { lat: 50.0350, lng: -110.6770 },
      { lat: 50.0390, lng: -110.6880 },
      { lat: 50.0430, lng: -110.6830 }
    ]
  },
  {
    id: 'order-4',
    orderNumber: 'CHK 104',
    customerName: 'Sarah Johnson',
    customerPhone: '403-555-0104',
    deliveryAddress: '17 Street SE, Medicine Hat',
    coordinates: { lat: 50.0410, lng: -110.6580 },
    status: 'en-route',
    assignedDriverId: 'driver-1',
    duration: '12 Min',
    timeOrdered: '10:20',
    items: ['1x Chicken Delight Combo', '1x Poutine'],
    total: 22.99,
    route: [
      { lat: 50.0280, lng: -110.6770 },
      { lat: 50.0280, lng: -110.6690 },
      { lat: 50.0340, lng: -110.6690 },
      { lat: 50.0390, lng: -110.6690 },
      { lat: 50.0410, lng: -110.6580 }
    ]
  },
  {
    id: 'order-5',
    orderNumber: 'CHK 105',
    customerName: 'David Brown',
    customerPhone: '403-555-0105',
    deliveryAddress: '24 Street SE, Medicine Hat',
    coordinates: { lat: 50.0350, lng: -110.6550 },
    status: 'assign',
    assignedDriverId: null,
    duration: '15 Min',
    timeOrdered: '10:15',
    items: ['2x Wrap Combo', '2x Drinks'],
    total: 36.50,
    route: [
      { lat: 50.0280, lng: -110.6770 },
      { lat: 50.0280, lng: -110.6690 },
      { lat: 50.0340, lng: -110.6690 },
      { lat: 50.0350, lng: -110.6550 }
    ]
  },
  {
    id: 'order-6',
    orderNumber: 'CHK 106',
    customerName: 'Lisa Martinez',
    customerPhone: '403-555-0106',
    deliveryAddress: '29 Street SE, Medicine Hat',
    coordinates: { lat: 50.0250, lng: -110.6500 },
    status: 'delivered',
    assignedDriverId: 'driver-2',
    duration: '20 Min',
    timeOrdered: '09:55',
    items: ['1x Chicken Sandwich', '1x Salad'],
    total: 18.25,
    route: [
      { lat: 50.0280, lng: -110.6770 },
      { lat: 50.0230, lng: -110.6770 },
      { lat: 50.0230, lng: -110.6600 },
      { lat: 50.0250, lng: -110.6500 }
    ]
  },
];
