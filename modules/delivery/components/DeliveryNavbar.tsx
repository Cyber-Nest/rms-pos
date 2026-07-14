'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Clock, ArrowLeft } from 'lucide-react';
import { useDeliveryStore } from '../store/deliveryStore';

export default function DeliveryNavbar() {
  const orders = useDeliveryStore((s) => s.orders);
  const [currentTime, setCurrentTime] = useState('');

  const deliveryCount = orders.filter((o) => o.status !== 'delivered').length;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="flex items-center justify-between px-5 h-14 bg-neutral-900 text-white font-sans border-b border-white/5">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/8 text-white hover:bg-white/15 transition-colors cursor-pointer"
          onClick={() => window.history.back()}
          title="Go back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-[34px] h-[34px] rounded-lg bg-brand-primary flex items-center justify-center text-white">
            <Truck size={20} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[13px] font-bold tracking-tight text-white">Chicken Delight</span>
            <span className="text-[10px] font-medium text-white/50 uppercase tracking-widest">Dispatch System</span>
          </div>
        </div>
      </div>

      {/* Center */}
      <div className="flex items-center gap-1.5 text-[13px] font-medium text-white/60 tabular-nums">
        <Clock size={14} className="opacity-50" />
        <span>{currentTime}</span>
      </div>

      {/* Right */}
      <div className="flex items-center">
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-brand-primary rounded-lg text-xs font-semibold text-white">
          <Truck size={16} />
          <span>Delivery Orders</span>
          <span className="bg-white text-brand-primary text-[11px] font-extrabold rounded-md px-1.5 py-0.5 min-w-[22px] text-center">
            {deliveryCount}
          </span>
        </div>
      </div>
    </nav>
  );
}
