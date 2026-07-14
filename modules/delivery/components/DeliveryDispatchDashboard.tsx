'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import DeliveryNavbar from './DeliveryNavbar';
import DispatchPanel from './DispatchPanel';
import VehicleAssignModal from './VehicleAssignModal';

// Dynamic import for Leaflet (SSR not supported)
const DeliveryMap = dynamic(() => import('./DeliveryMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-brand-bg text-neutral-500 text-sm font-medium">
      <div className="w-8 h-8 border-3 border-neutral-200 border-t-brand-primary rounded-full animate-spin" />
      <span>Loading Map...</span>
    </div>
  ),
});

export default function DeliveryDispatchDashboard() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-brand-bg select-none">
      <DeliveryNavbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[35%] min-w-[360px] max-w-[480px] flex flex-col border-r border-neutral-200 bg-white overflow-hidden">
          <DispatchPanel />
        </div>
        <div className="flex-1 w-[65%] relative overflow-hidden">
          <DeliveryMap />
        </div>
      </div>
      <VehicleAssignModal />
    </div>
  );
}
