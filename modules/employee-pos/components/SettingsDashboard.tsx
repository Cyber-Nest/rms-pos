'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import OrdersNavbar from './OrdersNavbar';
import POSSidebarDrawer from './POSSidebarDrawer';

// Split Tab Components
import MainSettingsTab from './settings-components/MainSettingsTab';
import TerminalSetupTab from './settings-components/TerminalSetupTab';
import TillSetupTab from './settings-components/TillSetupTab';
import StoreTimingsTab from './settings-components/StoreTimingsTab';
import StoreTimingsUpdateTab from './settings-components/StoreTimingsUpdateTab';
import HolidaysTab from './settings-components/HolidaysTab';

// Shared Types
import { TabType, Terminal, Till, StoreTiming, TimingUpdate, Holiday } from './settings-components/settingsTypes';

export default function SettingsDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('main_settings');

  // ── 1. Main Settings State ──
  const [mainSettings, setMainSettings] = useState({
    timezone: 'Mountain Standard Time (MST) - America/Edmonton',
    defaultTime: '15',
    reportingStartTime: '12:00 AM',
    reportingEndTime: '12:00 AM',
    latitude: '51.05643',
    longitude: '-113.37832',
    commission: '0.00',
    gstNumber: '123456789',
    showMenuImage: true,
    showCategoryImage: true,
    backgroundColor: '#000000'
  });

  // ── 2. Terminal Setup State ──
  const [terminals, setTerminals] = useState<Terminal[]>([]);

  // ── 3. Till Setup State ──
  const [tills, setTills] = useState<Till[]>([]);

  // ── 4. Store Timings State ──
  const [storeTimings, setStoreTimings] = useState<StoreTiming[]>([
    { day: 'Sunday', startTime: '10:00 AM', endTime: '08:00 PM', isHoliday: 'No' },
    { day: 'Monday', startTime: '10:00 AM', endTime: '09:00 PM', isHoliday: 'No' },
    { day: 'Tuesday', startTime: '10:00 AM', endTime: '09:00 PM', isHoliday: 'No' },
    { day: 'Wednesday', startTime: '10:00 AM', endTime: '09:00 PM', isHoliday: 'No' },
    { day: 'Thursday', startTime: '10:00 AM', endTime: '09:00 PM', isHoliday: 'No' },
    { day: 'Friday', startTime: '10:00 AM', endTime: '10:00 PM', isHoliday: 'No' },
    { day: 'Saturday', startTime: '10:00 AM', endTime: '10:00 PM', isHoliday: 'No' },
  ]);

  // ── 5. Store Timings Update State ──
  const [timingsUpdates, setTimingsUpdates] = useState<TimingUpdate[]>([]);

  // ── 6. Holidays State ──
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  // ── Main Settings Submit Handler ──
  const handleMainSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Main Settings updated successfully!');
  };

  // ── Store Timings Submit Handler ──
  const handleStoreTimingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Store Timings updated successfully!');
  };

  return (
    <main className="min-h-screen bg-[#F5F4F1] font-sans flex flex-col antialiased">
      
      {/* Navbar Header */}
      <OrdersNavbar 
        onToggleSidebar={() => setIsSidebarOpen(true)} 
      />

      <div className="flex-1 p-4 md:p-6 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Horizontal Navigation Tabs Bar */}
        <div className="overflow-x-auto pb-1 scrollbar-thin">
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200 w-max max-w-full">
            
            <button
              onClick={() => setActiveTab('main_settings')}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-800 tracking-wide uppercase transition-all duration-150 cursor-pointer ${
                activeTab === 'main_settings'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-neutral-500 hover:text-brand-primary'
              }`}
            >
              Main Settings
            </button>

            <button
              onClick={() => setActiveTab('terminal_setup')}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-800 tracking-wide uppercase transition-all duration-150 cursor-pointer ${
                activeTab === 'terminal_setup'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-neutral-500 hover:text-brand-primary'
              }`}
            >
              Terminal Setup
            </button>

            <button
              onClick={() => setActiveTab('till_setup')}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-800 tracking-wide uppercase transition-all duration-150 cursor-pointer ${
                activeTab === 'till_setup'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-neutral-500 hover:text-brand-primary'
              }`}
            >
              Cash Register (Till) Setup
            </button>

            <button
              onClick={() => setActiveTab('store_timings')}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-800 tracking-wide uppercase transition-all duration-150 cursor-pointer ${
                activeTab === 'store_timings'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-neutral-500 hover:text-brand-primary'
              }`}
            >
              Store Timings
            </button>

            <button
              onClick={() => setActiveTab('store_timings_update')}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-800 tracking-wide uppercase transition-all duration-150 cursor-pointer ${
                activeTab === 'store_timings_update'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-neutral-500 hover:text-brand-primary'
              }`}
            >
              Store Timings Update
            </button>

            <button
              onClick={() => setActiveTab('holidays')}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-800 tracking-wide uppercase transition-all duration-150 cursor-pointer ${
                activeTab === 'holidays'
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-neutral-500 hover:text-brand-primary'
              }`}
            >
              Holidays
            </button>

          </div>
        </div>

        {/* Tab Panel View Container */}
        <div className="bg-white border border-[#E7E5E4] rounded-2xl shadow-xs p-6">
          
          {activeTab === 'main_settings' && (
            <MainSettingsTab
              mainSettings={mainSettings}
              setMainSettings={setMainSettings}
              onSubmit={handleMainSettingsSubmit}
            />
          )}

          {activeTab === 'terminal_setup' && (
            <TerminalSetupTab
              terminals={terminals}
              setTerminals={setTerminals}
            />
          )}

          {activeTab === 'till_setup' && (
            <TillSetupTab
              tills={tills}
              setTills={setTills}
            />
          )}

          {activeTab === 'store_timings' && (
            <StoreTimingsTab
              storeTimings={storeTimings}
              setStoreTimings={setStoreTimings}
              onSubmit={handleStoreTimingsSubmit}
            />
          )}

          {activeTab === 'store_timings_update' && (
            <StoreTimingsUpdateTab
              timingsUpdates={timingsUpdates}
              setTimingsUpdates={setTimingsUpdates}
            />
          )}

          {activeTab === 'holidays' && (
            <HolidaysTab
              holidays={holidays}
              setHolidays={setHolidays}
            />
          )}

        </div>

      </div>

      {/* Sidebar Navigation Drawer Overlay */}
      <POSSidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab="setting"
        onSelectTab={(tabKey) => {
          if (tabKey === 'pos') {
            window.location.href = '/employee/pos';
          } else if (tabKey === 'kitchen') {
            window.location.href = '/employee/kitchen';
          } else if (tabKey === 'customers') {
            window.location.href = '/employee/customers';
          } else if (tabKey === 'setting') {
            setActiveTab('main_settings');
          } else if (
            ['orders', 'dashboard', 'sales_summary', 'expense_payout', 'transactions', 'reports', 'update_profile', 'change_password'].includes(tabKey)
          ) {
            let targetTab = tabKey;
            if (tabKey === 'transactions') targetTab = 'orders';
            window.location.href = `/employee/orders?view=${targetTab}`;
          }
          setIsSidebarOpen(false);
        }}
      />

    </main>
  );
}
