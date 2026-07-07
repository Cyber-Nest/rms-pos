'use client';

import React from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface MainSettings {
  timezone: string;
  defaultTime: string;
  reportingStartTime: string;
  reportingEndTime: string;
  latitude: string;
  longitude: string;
  commission: string;
  gstNumber: string;
  showMenuImage: boolean;
  showCategoryImage: boolean;
  backgroundColor: string;
}

interface MainSettingsTabProps {
  mainSettings: MainSettings;
  setMainSettings: React.Dispatch<React.SetStateAction<MainSettings>>;
  onSubmit: (e: React.FormEvent) => void;
}

export default function MainSettingsTab({
  mainSettings,
  setMainSettings,
  onSubmit
}: MainSettingsTabProps) {

  // Helper to fetch coordinates via Geolocation API
  const handleFetchGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    const toastId = toast.loading('Fetching current GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMainSettings((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        toast.success('GPS coordinates fetched successfully!', { id: toastId });
      },
      (error) => {
        console.error('GPS error:', error);
        toast.error(`Failed to fetch location: ${error.message}`, { id: toastId });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Timezone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-800 text-neutral-600 uppercase tracking-wider">
            Timezone <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={mainSettings.timezone}
              onChange={(e) => setMainSettings({ ...mainSettings, timezone: e.target.value })}
              className="w-full bg-neutral-100/80 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-brand-primary appearance-none cursor-pointer"
            >
              <option value="Mountain Standard Time (MST) - America/Edmonton">
                Mountain Standard Time (MST) - America/Edmonton
              </option>
              <option value="Eastern Standard Time (EST) - America/New_York">
                Eastern Standard Time (EST) - America/New_York
              </option>
              <option value="Pacific Standard Time (PST) - America/Los_Angeles">
                Pacific Standard Time (PST) - America/Los_Angeles
              </option>
              <option value="Indian Standard Time (IST) - Asia/Kolkata">
                Indian Standard Time (IST) - Asia/Kolkata
              </option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        {/* Default Time */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-800 text-neutral-600 uppercase tracking-wider">
            Default Time (Minutes) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={mainSettings.defaultTime}
            onChange={(e) => setMainSettings({ ...mainSettings, defaultTime: e.target.value })}
            className="w-full bg-neutral-100/80 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-brand-primary"
            placeholder="Enter default time"
          />
        </div>

        {/* Reporting Start Time */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-800 text-neutral-600 uppercase tracking-wider">
            Reporting Start Time <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={mainSettings.reportingStartTime}
            onChange={(e) => setMainSettings({ ...mainSettings, reportingStartTime: e.target.value })}
            className="w-full bg-neutral-100/80 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-brand-primary"
            placeholder="e.g. 12:00 AM"
          />
        </div>

        {/* Reporting End Time */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-800 text-neutral-600 uppercase tracking-wider">
            Reporting End Time <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={mainSettings.reportingEndTime}
            onChange={(e) => setMainSettings({ ...mainSettings, reportingEndTime: e.target.value })}
            className="w-full bg-neutral-100/80 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-brand-primary"
            placeholder="e.g. 12:00 AM"
          />
        </div>

        {/* Latitude */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-800 text-neutral-600 uppercase tracking-wider flex items-center justify-between">
            <span>Latitude <span className="text-red-500">*</span></span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={mainSettings.latitude}
              onChange={(e) => setMainSettings({ ...mainSettings, latitude: e.target.value })}
              className="w-full bg-neutral-100/80 border border-neutral-200 rounded-xl pl-4 pr-10 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-brand-primary"
            />
            <button
              type="button"
              onClick={handleFetchGPS}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-primary hover:text-[#70102b] cursor-pointer flex items-center justify-center p-1 hover:bg-brand-primary/10 rounded-lg transition-colors"
              title="Fetch GPS Coordinates"
            >
              <MapPin size={15} />
            </button>
          </div>
        </div>

        {/* Longitude */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-800 text-neutral-600 uppercase tracking-wider flex items-center justify-between">
            <span>Longitude <span className="text-red-500">*</span></span>
          </label>
          <input
            type="text"
            value={mainSettings.longitude}
            onChange={(e) => setMainSettings({ ...mainSettings, longitude: e.target.value })}
            className="w-full bg-neutral-100/80 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-brand-primary"
          />
        </div>

        {/* Commission */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-800 text-neutral-600 uppercase tracking-wider">
            Commission
          </label>
          <input
            type="text"
            value={mainSettings.commission}
            onChange={(e) => setMainSettings({ ...mainSettings, commission: e.target.value })}
            className="w-full bg-neutral-100/80 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-brand-primary"
          />
        </div>

        {/* GST Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-800 text-neutral-600 uppercase tracking-wider">
            GST Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={mainSettings.gstNumber}
            onChange={(e) => setMainSettings({ ...mainSettings, gstNumber: e.target.value })}
            className="w-full bg-neutral-100/80 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:outline-none focus:border-brand-primary"
          />
        </div>

      </div>

      {/* Toggles and Swatch */}
      <div className="flex flex-wrap items-center gap-10 pt-4 border-t border-neutral-100">
        
        {/* Show Menu Item Image */}
        {/* <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMainSettings({ ...mainSettings, showMenuImage: !mainSettings.showMenuImage })}
            className={`relative w-12 h-6.5 rounded-full transition-colors duration-250 cursor-pointer flex items-center ${
              mainSettings.showMenuImage ? 'bg-[#16A34A]' : 'bg-neutral-300'
            }`}
          >
            <span className={`text-[8px] font-900 text-white absolute ${mainSettings.showMenuImage ? 'left-2' : 'right-2'}`}>
              {mainSettings.showMenuImage ? 'ON' : 'OFF'}
            </span>
            <span className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-250 ${
              mainSettings.showMenuImage ? 'translate-x-[26px]' : 'translate-x-[2px]'
            }`} />
          </button>
          <span className="text-xs font-700 text-neutral-700">Show Menu Item Image?</span>
        </div> */}

        {/* Background Color Picker */}
        {/* <div className="flex items-center gap-3">
          <span className="text-xs font-700 text-neutral-700">Background Color:</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={mainSettings.backgroundColor}
              onChange={(e) => setMainSettings({ ...mainSettings, backgroundColor: e.target.value })}
              className="w-8 h-8 rounded-lg border border-neutral-300 cursor-pointer p-0 overflow-hidden"
            />
            <span className="text-xs font-800 font-mono text-neutral-800 uppercase">{mainSettings.backgroundColor}</span>
          </div>
        </div> */}

      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="px-8 py-2.5 rounded-full bg-[#8a1538] hover:bg-[#70102b] text-white text-[12px] font-800 transition-all cursor-pointer shadow-sm active:scale-98"
        >
          Submit
        </button>
      </div>

    </form>
  );
}
