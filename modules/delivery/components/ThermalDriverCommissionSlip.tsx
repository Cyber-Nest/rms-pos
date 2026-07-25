"use client";

import React from "react";

export interface DriverCommissionSlipData {
  driverName?: string;
  reportDate?: string;
  reportTime?: string;
  commissionSales?: number;
  numberOfOrders?: number;
  ratePercent?: number;
  ratePerOrder?: number;
  totalBeforeCutoff?: number;
  bonus?: number;
  driverBaseCommission?: number;
  driverAdditionalCommission?: number;
  driverCommissionReason?: string;
  driverTotalCommission?: number;
  totalCommissionDue?: number;
  commissionPaid?: number;
  prepaidTipsPaid?: number;
  terminalTipsPaid?: number;
  totalTipsPaid?: number;
  totalDriverEarning?: number;
  totalPaid?: number;
}

interface ThermalDriverCommissionSlipProps {
  data?: DriverCommissionSlipData;
}

const fmt = (val?: number) => (typeof val === "number" && !isNaN(val) ? val.toFixed(2) : "0.00");

export default function ThermalDriverCommissionSlip({
  data,
}: ThermalDriverCommissionSlipProps) {
  if (!data) return null;

  const driverName = data.driverName || "DRIVER";
  const reportDate = data.reportDate || "";
  const reportTime = data.reportTime || "";
  const commissionSales = fmt(data.commissionSales);
  const numberOfOrders = data.numberOfOrders ?? 0;
  const ratePercent = fmt(data.ratePercent);
  const ratePerOrder = fmt(data.ratePerOrder);
  const totalBeforeCutoff = fmt(data.totalBeforeCutoff);
  const driverBaseCommission = fmt(data.driverBaseCommission ?? (numberOfOrders * 6.00));
  const driverAdditionalCommission = fmt(data.driverAdditionalCommission ?? data.bonus);
  const driverTotalCommission = fmt(data.driverTotalCommission ?? data.totalCommissionDue ?? data.commissionPaid);
  
  const prepaidTipsPaid = fmt(data.prepaidTipsPaid);
  const terminalTipsPaid = fmt(data.terminalTipsPaid);
  const totalTipsPaid = fmt(data.totalTipsPaid ?? ((data.prepaidTipsPaid || 0) + (data.terminalTipsPaid || 0)));
  const totalPaid = fmt(data.totalPaid ?? data.totalDriverEarning);

  return (
    <div className="thermal-receipt-container font-mono text-neutral-900 text-[11px] leading-tight select-none">
      <div className="w-[80mm] max-w-full bg-white p-4 mx-auto border border-dashed border-neutral-300 shadow-sm print:shadow-none print:border-none">
        {/* Banner Box */}
        <div className="text-center font-800 text-[11px] leading-snug tracking-wider">
          <p className="overflow-hidden whitespace-nowrap">
            ****************************************
          </p>
          <p className="flex justify-between px-2">
            <span>**</span>
            <span>Driver Commission</span>
            <span>**</span>
          </p>
          <p className="flex justify-between px-2 uppercase font-900">
            <span>**</span>
            <span>{driverName}</span>
            <span>**</span>
          </p>
          <p className="flex justify-between px-2 text-[10px] font-700">
            <span>**</span>
            <span>
              {reportDate} {reportTime}
            </span>
            <span>**</span>
          </p>
          <p className="overflow-hidden whitespace-nowrap">
            ****************************************
          </p>
        </div>

        {/* Breakdown Items */}
        <div className="py-3 space-y-1.5 text-[11px]">
          <div className="flex justify-between font-600">
            <span>Commission Sales....:</span>
            <span className="font-700">{commissionSales}</span>
          </div>

          <div className="flex justify-between font-600">
            <span>Number of Orders....:</span>
            <span className="font-700">{numberOfOrders}</span>
          </div>

          <div className="flex justify-between font-600">
            <span>Rate %..............:</span>
            <span className="font-700">{ratePercent}%</span>
          </div>

          <div className="flex justify-between font-600">
            <span>Rate Per Order......:</span>
            <span className="font-700">{ratePerOrder}</span>
          </div>

          <div className="flex justify-between font-600">
            <span>Total Before Cut-Off:</span>
            <span className="font-700">{totalBeforeCutoff}</span>
          </div>

          {/* TIPS BREAKDOWN */}
          <div className="pt-1.5 border-t border-dashed border-neutral-300 space-y-1">
            <div className="flex justify-between font-600">
              <span>Prepaid Tips Paid...:</span>
              <span className="font-700">{prepaidTipsPaid}</span>
            </div>

            <div className="flex justify-between font-600">
              <span>Terminal Tips Paid..:</span>
              <span className="font-700">{terminalTipsPaid}</span>
            </div>

            <div className="flex justify-between font-700 border-t border-dotted border-neutral-300 pt-0.5">
              <span>Total Tips Earned...:</span>
              <span className="font-800">{totalTipsPaid}</span>
            </div>
          </div>

          {/* COMMISSION BREAKDOWN */}
          <div className="pt-1.5 border-t border-dashed border-neutral-300 space-y-1">
            <div className="flex justify-between font-600">
              <span>Driver Base Comm....:</span>
              <span className="font-700">{driverBaseCommission}</span>
            </div>

            {(parseFloat(driverAdditionalCommission) > 0 || (data.driverAdditionalCommission ?? 0) > 0 || (data.bonus ?? 0) > 0) && (
              <>
                <div className="flex justify-between font-700 text-amber-900">
                  <span>Driver Addl Comm...:</span>
                  <span className="font-800">+{driverAdditionalCommission}</span>
                </div>
                {data.driverCommissionReason && (
                  <div className="flex justify-between text-[9.5px] italic text-neutral-600 pl-2">
                    <span>Reason:</span>
                    <span>{data.driverCommissionReason}</span>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between font-800 text-[11.5px] pt-1 border-t border-neutral-300">
              <span>Driver Total Comm..:</span>
              <span>{driverTotalCommission}</span>
            </div>
          </div>

          {/* TOTAL PAID / DRIVER EARNING */}
          <div className="flex justify-between font-900 text-[12px] pt-2 border-t border-b border-black py-1">
            <span>Total Driver Earning:</span>
            <span className="font-900">${totalPaid}</span>
          </div>
        </div>

        {/* Terms & Conditions Notes */}
        <div className="text-[10px] font-700 space-y-0.5 my-2">
          <p className="font-800 uppercase">Pay on NET</p>
          <p className="uppercase text-neutral-800">
            DO NOT PAY on canceled orders.
          </p>
          <p className="uppercase text-neutral-800">
            DO NOT PAY on lates and coupons.
          </p>
        </div>

        {/* Driver Signature Line */}
        <div className="pt-4 pb-2 space-y-4 text-[10.5px]">
          <p className="font-600 leading-snug">
            I have received the above commission amount in cash.
          </p>
          <div className="pt-2">
            <p className="font-700">Signature: __________________________</p>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="text-center font-800 text-[10px] pt-2">
          <p className="overflow-hidden whitespace-nowrap">
            ****************************************
          </p>
        </div>
      </div>
    </div>
  );
}
