'use client';

import React from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface MainSettings {
  timezone: string;
  defaultTimeMinutes: string;
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
  saving?: boolean;
}

export default function MainSettingsTab({
  mainSettings,
  setMainSettings,
  onSubmit,
  saving = false,
}: MainSettingsTabProps) {
  const [isEditing, setIsEditing] = React.useState(false);

  // Helper to fetch coordinates via Geolocation API
  const handleFetchGPS = () => {
    if (!isEditing) return;
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(e);
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Timezone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-800 text-neutral-600 uppercase tracking-wider">
            Timezone <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              disabled={!isEditing}
              value={mainSettings.timezone}
              onChange={(e) => setMainSettings({ ...mainSettings, timezone: e.target.value })}
              className={`w-full border rounded-xl px-4 py-2.5 text-xs font-700 transition-all ${
                isEditing
                  ? 'bg-white border-brand-primary/40 text-neutral-900 focus:outline-none focus:border-brand-primary'
                  : 'bg-neutral-100/70 border-neutral-200 text-neutral-600 cursor-not-allowed'
              } appearance-none`}
            >
              <option value="Mountain Standard Time (MST) - America/Edmonton">
                Mountain Standard Time (MST) - America/Edmonton
              </option>
              <option value="Eastern Standard Time (EST) - America/New_York">
                Eastern Standard Time (EST) - America/New_York
              </option>
              <option value="Central Standard Time (CST) - America/Chicago">
                Central Standard Time (CST) - America/Chicago
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
            Default Prep Time (Minutes) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            disabled={!isEditing}
            value={mainSettings.defaultTimeMinutes || '15'}
            onChange={(e) => setMainSettings({ ...mainSettings, defaultTimeMinutes: e.target.value })}
            className={`w-full border rounded-xl px-4 py-2.5 text-xs font-700 transition-all ${
              isEditing
                ? 'bg-white border-brand-primary/40 text-neutral-900 focus:outline-none focus:border-brand-primary'
                : 'bg-neutral-100/70 border-neutral-200 text-neutral-600 cursor-not-allowed'
            }`}
          />
        </div>

        {/* Reporting Start Time */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-800 text-neutral-600 uppercase tracking-wider">
            Reporting Start Time <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            disabled={!isEditing}
            value={mainSettings.reportingStartTime}
            onChange={(e) => setMainSettings({ ...mainSettings, reportingStartTime: e.target.value })}
            className={`w-full border rounded-xl px-4 py-2.5 text-xs font-700 transition-all ${
              isEditing
                ? 'bg-white border-brand-primary/40 text-neutral-900 focus:outline-none focus:border-brand-primary'
                : 'bg-neutral-100/70 border-neutral-200 text-neutral-600 cursor-not-allowed'
            }`}
          />
        </div>

        {/* Reporting End Time */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-800 text-neutral-600 uppercase tracking-wider">
            Reporting End Time <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            disabled={!isEditing}
            value={mainSettings.reportingEndTime}
            onChange={(e) => setMainSettings({ ...mainSettings, reportingEndTime: e.target.value })}
            className={`w-full border rounded-xl px-4 py-2.5 text-xs font-700 transition-all ${
              isEditing
                ? 'bg-white border-brand-primary/40 text-neutral-900 focus:outline-none focus:border-brand-primary'
                : 'bg-neutral-100/70 border-neutral-200 text-neutral-600 cursor-not-allowed'
            }`}
          />
        </div>

        {/* Latitude */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-800 text-neutral-600 uppercase tracking-wider">
            Latitude <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              disabled={!isEditing}
              value={mainSettings.latitude}
              onChange={(e) => setMainSettings({ ...mainSettings, latitude: e.target.value })}
              className={`w-full border rounded-xl pl-4 pr-10 py-2.5 text-xs font-700 transition-all ${
                isEditing
                  ? 'bg-white border-brand-primary/40 text-neutral-900 focus:outline-none focus:border-brand-primary'
                  : 'bg-neutral-100/70 border-neutral-200 text-neutral-600 cursor-not-allowed'
              }`}
            />
            {isEditing && (
              <button
                type="button"
                onClick={handleFetchGPS}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-brand-primary hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                title="Fetch Current Location"
              >
                <MapPin size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Longitude */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-800 text-neutral-600 uppercase tracking-wider">
            Longitude <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            disabled={!isEditing}
            value={mainSettings.longitude}
            onChange={(e) => setMainSettings({ ...mainSettings, longitude: e.target.value })}
            className={`w-full border rounded-xl px-4 py-2.5 text-xs font-700 transition-all ${
              isEditing
                ? 'bg-white border-brand-primary/40 text-neutral-900 focus:outline-none focus:border-brand-primary'
                : 'bg-neutral-100/70 border-neutral-200 text-neutral-600 cursor-not-allowed'
            }`}
          />
        </div>

        {/* Commission */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-800 text-neutral-600 uppercase tracking-wider">
            Commission
          </label>
          <input
            type="text"
            disabled={!isEditing}
            value={mainSettings.commission}
            onChange={(e) => setMainSettings({ ...mainSettings, commission: e.target.value })}
            className={`w-full border rounded-xl px-4 py-2.5 text-xs font-700 transition-all ${
              isEditing
                ? 'bg-white border-brand-primary/40 text-neutral-900 focus:outline-none focus:border-brand-primary'
                : 'bg-neutral-100/70 border-neutral-200 text-neutral-600 cursor-not-allowed'
            }`}
          />
        </div>

        {/* GST Number */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-800 text-neutral-600 uppercase tracking-wider">
            GST Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            disabled={!isEditing}
            value={mainSettings.gstNumber}
            onChange={(e) => setMainSettings({ ...mainSettings, gstNumber: e.target.value })}
            className={`w-full border rounded-xl px-4 py-2.5 text-xs font-700 transition-all ${
              isEditing
                ? 'bg-white border-brand-primary/40 text-neutral-900 focus:outline-none focus:border-brand-primary'
                : 'bg-neutral-100/70 border-neutral-200 text-neutral-600 cursor-not-allowed'
            }`}
          />
        </div>

      </div>

      {/* Edit & Submit Actions Bar */}
      <div className="flex justify-end items-center gap-3 pt-4 border-t border-neutral-100">
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-8 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-[12px] font-800 transition-all cursor-pointer shadow-sm active:scale-98"
          >
            Edit Settings
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={saving}
              className="px-6 py-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[12px] font-700 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-2.5 rounded-full bg-[#8a1538] hover:bg-[#70102b] text-white text-[12px] font-800 transition-all cursor-pointer shadow-sm active:scale-98 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </>
        )}
      </div>

    </form>
  );
}
