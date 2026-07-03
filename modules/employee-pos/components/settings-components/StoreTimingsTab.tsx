'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { StoreTiming } from './settingsTypes';

interface StoreTimingsTabProps {
  storeTimings: StoreTiming[];
  setStoreTimings: React.Dispatch<React.SetStateAction<StoreTiming[]>>;
  onSubmit: (e: React.FormEvent) => void;
}

export default function StoreTimingsTab({
  storeTimings,
  setStoreTimings,
  onSubmit
}: StoreTimingsTabProps) {

  const handleTimingFieldChange = (index: number, field: keyof StoreTiming, value: string) => {
    setStoreTimings(storeTimings.map((t, idx) => 
      idx === index ? { ...t, [field]: value } : t
    ));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      
      <div className="overflow-x-auto border border-neutral-100 rounded-xl">
        <table className="w-full border-collapse text-left text-xs font-medium text-neutral-700">
          <thead className="bg-neutral-900 text-white font-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="px-6 py-3 border-b border-neutral-200">Day</th>
              <th className="px-6 py-3 border-b border-neutral-200">Start Time</th>
              <th className="px-6 py-3 border-b border-neutral-200">End Time</th>
              <th className="px-6 py-3 border-b border-neutral-200">Is Holiday</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {storeTimings.map((t, idx) => (
              <tr key={t.day} className="hover:bg-neutral-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-800">{t.day}</td>
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <input
                    type="text"
                    value={t.startTime}
                    onChange={(e) => handleTimingFieldChange(idx, 'startTime', e.target.value)}
                    className="bg-neutral-100/80 border border-neutral-200 rounded-xl px-4 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-brand-primary w-[140px]"
                  />
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <input
                    type="text"
                    value={t.endTime}
                    onChange={(e) => handleTimingFieldChange(idx, 'endTime', e.target.value)}
                    className="bg-neutral-100/80 border border-neutral-200 rounded-xl px-4 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-brand-primary w-[140px]"
                  />
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <div className="relative w-[110px]">
                    <select
                      value={t.isHoliday}
                      onChange={(e) => handleTimingFieldChange(idx, 'isHoliday', e.target.value)}
                      className="w-full bg-neutral-100/80 border border-neutral-200 rounded-xl px-4 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-brand-primary appearance-none cursor-pointer"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-8 py-2.5 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white text-[12px] font-800 transition-all cursor-pointer shadow-sm active:scale-98"
        >
          Submit
        </button>
      </div>

    </form>
  );
}
