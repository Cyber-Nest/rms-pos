'use client';

import React, { useState } from 'react';
import { MapPin, Clock, Phone, ChevronDown, ChevronUp, Check, User } from 'lucide-react';
import { DeliveryOrder } from '../types/delivery';
import { useDeliveryStore } from '../store/deliveryStore';

interface OrderCardProps {
  order: DeliveryOrder;
}

export default function OrderCard({ order }: OrderCardProps) {
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);
  const selectOrder = useDeliveryStore((s) => s.selectOrder);
  const selectedOrderId = useDeliveryStore((s) => s.selectedOrderId);
  const assignDriver = useDeliveryStore((s) => s.assignDriver);
  const markDelivered = useDeliveryStore((s) => s.markDelivered);
  const getDriversWithVehicles = useDeliveryStore((s) => s.getDriversWithVehicles);
  const drivers = useDeliveryStore((s) => s.drivers);

  const isSelected = selectedOrderId === order.id;
  const assignedDriver = order.assignedDriverId
    ? drivers.find((d) => d.id === order.assignedDriverId)
    : null;
  const availableDrivers = getDriversWithVehicles().filter(
    (d) => d.status === 'available' || d.id === order.assignedDriverId
  );

  const handleAssign = (driverId: string) => {
    assignDriver(order.id, driverId);
    setShowDriverDropdown(false);
  };

  return (
    <div
      className={`bg-white border rounded-xl p-3 px-3.5 cursor-pointer transition-all animate-scale-up relative
        ${showDriverDropdown ? 'z-30' : 'z-10'}
        ${isSelected ? 'border-brand-primary shadow-[0_0_0_1px_#8a1538,0_3px_12px_rgba(138,21,56,0.08)]' : 'border-neutral-200 hover:border-neutral-300 hover:shadow-sm'}
        ${order.status === 'en-route' ? 'border-l-[3px] border-l-blue-600' : ''}
        ${order.status === 'delivered' ? 'border-l-[3px] border-l-green-600 opacity-70' : ''}
      `}
      onClick={() => selectOrder(order.id)}
    >
      {/* Header Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-[30px] h-[30px] rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-500">
            <User size={14} />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-semibold text-neutral-900 leading-tight">{order.customerName}</span>
            <span className="flex items-center gap-1 text-[11px] text-neutral-500 tabular-nums">
              <Phone size={10} />
              {order.customerPhone}
            </span>
          </div>
        </div>
        <span className="text-[11px] font-bold text-brand-primary bg-brand-primary-light px-2 py-0.5 rounded-md tracking-wide">
          {order.orderNumber}
        </span>
      </div>

      {/* Address */}
      <div className="flex items-start gap-1.5 text-[11.5px] text-neutral-600 mb-2 leading-snug">
        <MapPin size={12} className="shrink-0 mt-0.5 text-neutral-400" />
        <span>{order.deliveryAddress}</span>
      </div>

      {/* Meta Row */}
      <div className="flex gap-3.5 mb-2.5">
        <div className="flex items-center gap-1 text-[10.5px] text-neutral-500">
          <Clock size={11} />
          <span>Duration: <strong className="text-neutral-700 font-semibold">{order.duration}</strong></span>
        </div>
        <div className="flex items-center gap-1 text-[10.5px] text-neutral-500">
          <Clock size={11} />
          <span>Time Ordered: <strong className="text-neutral-700 font-semibold">{order.timeOrdered}</strong></span>
        </div>
      </div>

      {/* Status / Action Row */}
      <div className="flex items-center">
        {order.status === 'assign' && (
          <div className="flex items-center gap-2 w-full justify-between">
            <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
              Ready
            </span>
            <div className="relative">
              <button
                className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold text-white bg-brand-primary rounded-md hover:bg-brand-primary-hover transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDriverDropdown(!showDriverDropdown);
                }}
              >
                Assign Driver {showDriverDropdown ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              {showDriverDropdown && (
                <div className="absolute top-full right-0 mt-1 min-w-[200px] bg-white border border-neutral-200 rounded-xl shadow-lg z-50 overflow-hidden animate-scale-up">
                  {availableDrivers.length === 0 ? (
                    <div className="p-3.5 text-xs text-neutral-400 text-center">
                      No drivers with vehicles available
                    </div>
                  ) : (
                    availableDrivers.map((driver) => (
                      <button
                        key={driver.id}
                        className="flex items-center gap-2 w-full px-3.5 py-2.5 text-xs font-medium text-neutral-900 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 cursor-pointer text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssign(driver.id);
                        }}
                      >
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: driver.color }} />
                        <span>{driver.name}</span>
                        {driver.assignedVehicle && (
                          <span className="text-[10px] font-bold text-brand-primary bg-brand-primary-light px-1.5 rounded ml-auto">
                            V#{driver.assignedVehicle.number}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {order.status === 'en-route' && assignedDriver && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-neutral-700">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: assignedDriver.color }} />
              <span>{assignedDriver.name}</span>
              {assignedDriver.assignedVehicle && (
                <span className="text-[10px] font-bold text-brand-primary bg-brand-primary-light px-1.5 rounded">
                  V#{assignedDriver.assignedVehicle.number}
                </span>
              )}
            </div>
            <button
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                markDelivered(order.id);
              }}
            >
              <Check size={12} /> Delivered
            </button>
          </div>
        )}

        {order.status === 'delivered' && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
            <Check size={14} />
            <span>Delivered</span>
          </div>
        )}
      </div>
    </div>
  );
}
