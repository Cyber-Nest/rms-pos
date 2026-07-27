"use client";

import React, { useState, useMemo } from "react";
import { 
  Truck, Calendar, User, Search, Printer, DollarSign, 
  CheckCircle, FileText, ArrowRightLeft, 
  XCircle, Award, CreditCard, Wallet, RefreshCw, X, Check, Lock
} from "lucide-react";
import PosNavbar from "@/modules/employee-pos/components/PosNavbar";
import POSSidebarDrawer from "@/modules/employee-pos/components/POSSidebarDrawer";
import ThermalDriverSalesReport, { DriverDropSummaryData } from "./ThermalDriverSalesReport";
import ThermalDriverCommissionSlip, { DriverCommissionSlipData } from "./ThermalDriverCommissionSlip";
import toast from "react-hot-toast";

// ── Dummy Drivers Data ──
interface DriverInfo {
  id: string; // e.g. "6"
  driverId: string; // e.g. "DRV-006"
  name: string;
  phone: string;
  vehicle: string;
  status: "Available" | "Completed Shift" | "On Delivery";
}

const DUMMY_DRIVERS: DriverInfo[] = [
  { id: "6", driverId: "DRV-006", name: "NOUR, MOHAMMAD", phone: "(587) 365-5401", vehicle: "Vehicle #102 - Honda Civic", status: "Completed Shift" },
  { id: "12", driverId: "DRV-012", name: "ALEXANDER, SMITH", phone: "(587) 998-1234", vehicle: "Vehicle #105 - Toyota Corolla", status: "Completed Shift" },
  { id: "8", driverId: "DRV-008", name: "SAM, WILSON", phone: "(587) 443-8821", vehicle: "Vehicle #108 - Hyundai Elantra", status: "Available" },
];

// ── Dummy Delivered Orders per Driver ──
interface OrderRow {
  id: string;
  ticketName: string;
  customerName: string;
  phone: string;
  address: string;
  time: string;
  total: number;
  dc: number; // Delivery Charge ($6.00)
  pd: "PP" | "TM" | "CS"; // PP = Prepaid, TM = Terminal Card, CS = Cash
  prepaidTip: number;
  terminalTip: number;
  cashGiven: number;
}

const DUMMY_ORDERS_MAP: Record<string, OrderRow[]> = {
  "6": [
    { id: "101", ticketName: "103 Dagmara Jonker", customerName: "Dagmara Jonker", phone: "(587) 111-2233", address: "231 Edgefield Pl", time: "11:30 AM", total: 67.36, dc: 6.00, pd: "PP", prepaidTip: 9.18, terminalTip: 0, cashGiven: 0 },
    { id: "105", ticketName: "105 Cole Mosley", customerName: "Cole Mosley", phone: "(587) 222-3344", address: "445 Strathmore Ave", time: "12:15 PM", total: 44.39, dc: 6.00, pd: "PP", prepaidTip: 4.39, terminalTip: 0, cashGiven: 0 },
    { id: "109", ticketName: "109 Sarah Connor", customerName: "Sarah Connor", phone: "(587) 333-4455", address: "12 Riverside Dr", time: "01:05 PM", total: 44.50, dc: 6.00, pd: "TM", prepaidTip: 0, terminalTip: 8.50, cashGiven: 0 },
    { id: "112", ticketName: "112 Michael Scott", customerName: "Michael Scott", phone: "(587) 444-5566", address: "789 Paper Rd", time: "01:40 PM", total: 103.68, dc: 6.00, pd: "TM", prepaidTip: 0, terminalTip: 15.28, cashGiven: 0 },
    { id: "118", ticketName: "118 Jim Halpert", customerName: "Jim Halpert", phone: "(587) 555-6677", address: "55 Pam St", time: "02:10 PM", total: 18.71, dc: 6.00, pd: "CS", prepaidTip: 0, terminalTip: 0, cashGiven: 18.71 },
    { id: "122", ticketName: "122 Dwight Schrute", customerName: "Dwight Schrute", phone: "(587) 666-7788", address: "99 Beet Farm Way", time: "02:45 PM", total: 22.35, dc: 6.00, pd: "PP", prepaidTip: 0, terminalTip: 0, cashGiven: 0 },
    { id: "125", ticketName: "125 Pam Beesly", customerName: "Pam Beesly", phone: "(587) 777-8899", address: "10 Art Studio Ave", time: "03:15 PM", total: 15.00, dc: 6.00, pd: "PP", prepaidTip: 0, terminalTip: 0, cashGiven: 0 },
  ],
  "12": [
    { id: "201", ticketName: "201 Bruce Wayne", customerName: "Bruce Wayne", phone: "(587) 888-9900", address: "1 Manor Rd", time: "12:00 PM", total: 85.00, dc: 6.00, pd: "PP", prepaidTip: 12.00, terminalTip: 0, cashGiven: 0 },
    { id: "204", ticketName: "204 Clark Kent", customerName: "Clark Kent", phone: "(587) 999-0011", address: "33 Daily Planet", time: "01:30 PM", total: 42.50, dc: 6.00, pd: "CS", prepaidTip: 0, terminalTip: 0, cashGiven: 42.50 },
  ],
  "8": [
    { id: "301", ticketName: "301 Tony Stark", customerName: "Tony Stark", phone: "(587) 123-9999", address: "10880 Malibu Point", time: "02:00 PM", total: 150.00, dc: 6.00, pd: "PP", prepaidTip: 25.00, terminalTip: 0, cashGiven: 0 }
  ]
};

export default function DriverDropDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [driverSearchInput, setDriverSearchInput] = useState<string>("");
  
  // Modals state
  const [activePrintModal, setActivePrintModal] = useState<"sales" | "commission" | "both" | null>(null);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [isSalesDetailsModalOpen, setIsSalesDetailsModalOpen] = useState(false);

  // ── "Enter the Drop Below" Input States ──
  const [dropCash, setDropCash] = useState<string>("0.00");
  const [dropCreditCard, setDropCreditCard] = useState<string>("0.00");
  const [dropOther, setDropOther] = useState<string>("0.00");

  // ── Payout Confirmation Modal States ──
  const [hasAdditionalCommissionToggle, setHasAdditionalCommissionToggle] = useState<boolean>(true);
  const [additionalCommission, setAdditionalCommission] = useState<string>("1.50");
  const [additionalReason, setAdditionalReason] = useState<string>("Rain Allowance");

  // Active Driver Info (Returns null if no driver selected / searched)
  const selectedDriver = useMemo(() => {
    if (!selectedDriverId && !driverSearchInput.trim()) return null;
    return DUMMY_DRIVERS.find(d => 
      d.id === selectedDriverId || 
      d.driverId.toLowerCase() === driverSearchInput.trim().toLowerCase() ||
      d.name.toLowerCase().includes(driverSearchInput.trim().toLowerCase())
    ) || null;
  }, [selectedDriverId, driverSearchInput]);

  // Active Orders
  const orders = useMemo(() => {
    if (!selectedDriver) return [];
    return DUMMY_ORDERS_MAP[selectedDriver.id] || [];
  }, [selectedDriver]);

  // ── Calculation Logic ──
  const calculations = useMemo(() => {
    if (!selectedDriver) {
      return {
        totalOrders: 0,
        totalCancels: 0,
        totalSales: 0,
        prepaidSales: 0,
        prepaidTips: 0,
        totalNewSales: 0,
        terminalSales: 0,
        terminalTips: 0,
        cashSales: 0,
        saleDue: 0,
        driverBaseCommission: 0,
        driverAdditionalCommission: 0,
        driverTotalCommission: 0,
        totalTipsEarned: 0,
        totalDriverEarning: 0,
        netCashPayoutToDriver: 0,
        totalEnteredDrop: 0,
        numChecks: 0,
        ratePerOrder: 6.00,
      };
    }

    const totalOrders = orders.length;
    const totalCancels = 0;
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);

    const prepaidOrders = orders.filter(o => o.pd === "PP");
    const prepaidSales = prepaidOrders.reduce((sum, o) => sum + o.total, 0);
    const prepaidTips = orders.reduce((sum, o) => sum + o.prepaidTip, 0);

    const totalNewSales = totalSales - prepaidSales - prepaidTips;

    const terminalOrders = orders.filter(o => o.pd === "TM");
    const terminalSales = terminalOrders.reduce((sum, o) => sum + o.total, 0);
    const terminalTips = orders.reduce((sum, o) => sum + o.terminalTip, 0);

    const cashOrders = orders.filter(o => o.pd === "CS");
    const cashSales = cashOrders.reduce((sum, o) => sum + o.total, 0);

    const saleDue = Math.max(0, totalNewSales - terminalSales - terminalTips - cashSales);

    // Delivery Commissions ($6.00 flat per order)
    const driverBaseCommission = totalOrders * 6.00;
    const extraComm = hasAdditionalCommissionToggle ? (parseFloat(additionalCommission) || 0) : 0;
    const driverTotalCommission = driverBaseCommission + extraComm;

    const totalTipsEarned = prepaidTips + terminalTips;

    // Sum of entered drops
    const numCash = parseFloat(dropCash) || 0;
    const numCard = parseFloat(dropCreditCard) || 0;
    const numOther = parseFloat(dropOther) || 0;
    const totalEnteredDrop = numCash + numCard + numOther;

    // Total Driver Earnings & Net Cash Settlement
    const totalDriverEarning = totalTipsEarned + driverTotalCommission;
    const netCashPayoutToDriver = totalDriverEarning - cashSales;

    return {
      totalOrders,
      totalCancels,
      totalSales,
      prepaidSales,
      prepaidTips,
      totalNewSales,
      terminalSales,
      terminalTips,
      cashSales,
      saleDue,
      driverBaseCommission,
      driverAdditionalCommission: extraComm,
      driverTotalCommission,
      totalTipsEarned,
      totalDriverEarning,
      netCashPayoutToDriver,
      totalEnteredDrop,
      numChecks: 0,
      ratePerOrder: 6.00,
    };
  }, [selectedDriver, orders, dropCash, dropCreditCard, dropOther, hasAdditionalCommissionToggle, additionalCommission]);

  // Submit button is disabled if no driver selected OR Sale Due > 0
  const isSubmitDisabled = !selectedDriver || calculations.saleDue > 0;

  // Data for Thermal Sales Report
  const salesReportData: DriverDropSummaryData = useMemo(() => {
    return {
      employeeId: selectedDriver ? selectedDriver.id : "0",
      employeeName: selectedDriver ? selectedDriver.name : "DRIVER",
      reportDate: new Date(selectedDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      reportTime: "14:23:07",
      orders: orders.map(o => ({
        ticketName: o.ticketName,
        total: o.total,
        dc: o.dc,
        pd: o.pd,
      })),
      totalOrders: calculations.totalOrders,
      totalCancels: calculations.totalCancels,
      totalSales: calculations.totalSales,
      closedSales: 0,
      closedCharges: 0,
      prepaidSales: calculations.prepaidSales,
      totalNewSales: calculations.totalNewSales,
      terminalSales: calculations.terminalSales,
      terminalTips: calculations.terminalTips,
      cashSales: calculations.cashSales,
      saleDue: calculations.saleDue,
      openBanks: 0,
      cashDropped: parseFloat(dropCash) || 0,
      creditCardDrop: parseFloat(dropCreditCard) || 0,
      otherDrops: parseFloat(dropOther) || 0,
      checksDropped: 0,
      totalDue: calculations.saleDue,
      totalPrepaidTips: calculations.prepaidTips,
      paidPrepaidTips: 0,
      prepaidTipsDue: calculations.prepaidTips,
      driverBaseCommission: calculations.driverBaseCommission,
      driverAdditionalCommission: calculations.driverAdditionalCommission,
      driverCommissionReason: hasAdditionalCommissionToggle ? additionalReason : "",
      driverTotalCommission: calculations.driverTotalCommission,
      totalTips: calculations.totalTipsEarned,
      totalDriverEarning: calculations.totalDriverEarning,
      totalCommissionDue: calculations.driverTotalCommission,
    };
  }, [selectedDriver, selectedDate, orders, calculations, dropCash, dropCreditCard, dropOther, hasAdditionalCommissionToggle, additionalReason]);

  // Data for Thermal Commission Slip
  const commissionSlipData: DriverCommissionSlipData = useMemo(() => {
    return {
      driverName: selectedDriver ? selectedDriver.name : "DRIVER",
      reportDate: new Date(selectedDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
      reportTime: "14:23:02",
      commissionSales: calculations.totalSales,
      numberOfOrders: calculations.totalOrders,
      ratePercent: 0,
      ratePerOrder: calculations.ratePerOrder,
      totalBeforeCutoff: calculations.totalSales,
      bonus: calculations.driverAdditionalCommission,
      driverBaseCommission: calculations.driverBaseCommission,
      driverAdditionalCommission: calculations.driverAdditionalCommission,
      driverCommissionReason: hasAdditionalCommissionToggle ? additionalReason : "",
      driverTotalCommission: calculations.driverTotalCommission,
      prepaidTipsPaid: calculations.prepaidTips,
      terminalTipsPaid: calculations.terminalTips,
      totalTipsPaid: calculations.totalTipsEarned,
      totalDriverEarning: calculations.totalDriverEarning,
      totalPaid: calculations.totalDriverEarning,
    };
  }, [selectedDriver, selectedDate, calculations, hasAdditionalCommissionToggle, additionalReason]);

  const handleTriggerPrint = () => {
    window.print();
  };

  const handleOpenSettlement = () => {
    if (!selectedDriver) {
      toast.error("Please select a driver first!");
      return;
    }
    if (isSubmitDisabled) {
      toast.error(`Cannot submit settlement while Sale Due is $${calculations.saleDue.toFixed(2)}. Reconciliation must equal $0.00.`);
      return;
    }
    setIsSettlementModalOpen(true);
  };

  const handleFinalizeSettlement = () => {
    if (!selectedDriver) return;
    setIsSettlementModalOpen(false);
    toast.success(
      `Drop settlement finalized for ${selectedDriver.name}! Net Cash Payout: $${calculations.netCashPayoutToDriver.toFixed(2)}`
    );
    setActivePrintModal("both");
  };

  const handleCancelDropInputs = () => {
    setDropCash("0.00");
    setDropCreditCard("0.00");
    setDropOther("0.00");
    setAdditionalCommission("0.00");
    setAdditionalReason("");
    toast("Drop entries reset to 0.00");
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-brand-bg text-neutral-900 font-sans select-none">
      
      {/* ── Top POS Navbar ── */}
      <PosNavbar onToggleSidebar={() => setSidebarOpen(true)} />

      {/* ── Secondary Control Bar ── */}
      <div className="bg-white border-b border-neutral-200 px-6 py-3.5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 shadow-sm flex-shrink-0 select-none">
        
        {/* Left Side: Title */}
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-xl font-900 text-neutral-900 tracking-tight leading-none min-w-[140px] flex items-center gap-2">
            <span>Driver Drop</span>
          </h1>
        </div>

        {/* Right Side: Date Filter & Action Print Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="custom-date-pill bg-white border border-neutral-300 rounded-full pl-5 pr-10 py-1.5 text-[12px] font-750 text-[#1E3A8A] hover:border-neutral-400 focus:outline-none focus:border-brand-primary cursor-pointer transition-all shadow-sm w-[135px]"
            />
            <Calendar size={14} className="absolute right-4.5 top-1/2 -translate-y-1/2 text-[#1E3A8A] pointer-events-none" />
          </div>

          <button 
            onClick={() => {
              if (!selectedDriver) {
                toast.error("Please select a driver first!");
                return;
              }
              setActivePrintModal("sales");
            }}
            disabled={!selectedDriver}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-[12px] font-800 transition-all cursor-pointer shadow-sm select-none ${
              selectedDriver ? 'bg-[#851532] hover:bg-[#6b0f27] active:scale-95' : 'bg-neutral-300 text-neutral-500 cursor-not-allowed opacity-60'
            }`}
          >
            <Printer size={13} />
            <span>Sales Report Slip</span>
          </button>

          <button 
            onClick={() => {
              if (!selectedDriver) {
                toast.error("Please select a driver first!");
                return;
              }
              setActivePrintModal("commission");
            }}
            disabled={!selectedDriver}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-[12px] font-800 transition-all cursor-pointer shadow-sm select-none ${
              selectedDriver ? 'bg-[#851532] hover:bg-[#6b0f27] active:scale-95' : 'bg-neutral-300 text-neutral-500 cursor-not-allowed opacity-60'
            }`}
          >
            <FileText size={13} />
            <span>Commission Slip</span>
          </button>
        </div>
      </div>

      {/* ── Main Scrollable Area ── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-12 select-none">
        
        {/* ── Section 1: Driver Selection & Profile Card ── */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
          <div className="bg-brand-primary text-white px-4 py-2.5 font-900 text-[12px] uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-2">
              <User size={15} />
              <span>Driver Selection & Profile</span>
            </span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-700">
              {selectedDriver ? "Shift Active" : "No Driver Selected"}
            </span>
          </div>

          <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            
            {/* Driver Select / Search Column */}
            <div className="lg:col-span-5 space-y-3">
              <label className="text-[10px] font-800 uppercase tracking-wider text-neutral-500 block">
                Select Driver / Search by ID or Name
              </label>

              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input 
                  type="text"
                  placeholder="Enter Driver ID (e.g. 6) or Name..."
                  value={driverSearchInput}
                  onChange={(e) => setDriverSearchInput(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-lg pl-9 pr-3 py-2 text-[12px] text-neutral-700 placeholder-neutral-400 focus:outline-none focus:border-brand-primary focus:bg-white transition-all font-600"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {DUMMY_DRIVERS.map((d) => {
                  const isSelected = selectedDriver?.id === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedDriverId("");
                          setDriverSearchInput("");
                        } else {
                          setSelectedDriverId(d.id);
                          setDriverSearchInput("");
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-800 uppercase transition-all cursor-pointer border flex items-center gap-2 ${
                        isSelected 
                          ? 'bg-brand-primary text-white border-brand-primary shadow-xs' 
                          : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-brand-primary/30 hover:bg-brand-primary-light'
                      }`}
                    >
                      <span>#{d.id} - {d.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Driver Profile Info OR Empty State Placeholder */}
            {selectedDriver ? (
              <div className="lg:col-span-7 bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-200/80 pb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-primary text-white font-900 text-sm flex items-center justify-center shadow-xs">
                      #{selectedDriver.id}
                    </div>
                    <div>
                      <h2 className="text-sm font-900 text-neutral-900 tracking-tight flex items-center gap-2">
                        {selectedDriver.name}
                        <span className="text-[10px] font-800 px-2 py-0.5 rounded bg-brand-primary-light text-brand-primary border border-brand-primary-muted uppercase">
                          ID: {selectedDriver.driverId}
                        </span>
                      </h2>
                      <p className="text-[11px] text-neutral-500 font-600 flex items-center gap-3 mt-0.5">
                        <span>📞 {selectedDriver.phone}</span>
                        <span>🚗 {selectedDriver.vehicle}</span>
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-800 uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {selectedDriver.status}
                  </span>
                </div>

                {/* Quick Stat Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-[11px]">
                  <div className="bg-white p-2 rounded-lg border border-neutral-200">
                    <p className="text-[9.5px] font-800 text-neutral-500 uppercase">Deliveries</p>
                    <p className="font-900 text-neutral-900 text-sm">{calculations.totalOrders}</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-neutral-200">
                    <p className="text-[9.5px] font-800 text-neutral-500 uppercase">Total Sales</p>
                    <p className="font-900 text-emerald-700 text-sm">${calculations.totalSales.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-neutral-200">
                    <p className="text-[9.5px] font-800 text-neutral-500 uppercase">DC Earned</p>
                    <p className="font-900 text-brand-primary text-sm">${calculations.driverTotalCommission.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-neutral-200">
                    <p className="text-[9.5px] font-800 text-neutral-500 uppercase">Cash Collected</p>
                    <p className="font-900 text-rose-700 text-sm">${calculations.cashSales.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-7 bg-neutral-50 border border-dashed border-neutral-300 rounded-xl p-5 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-900 text-neutral-800 uppercase tracking-wide">No Driver Selected</h3>
                  <p className="text-[11px] text-neutral-500 max-w-sm font-500 mt-0.5">
                    Select a driver from the left chips or search by ID/Name to load shift settlement.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Conditional Lower Dashboard Sections (Only shown when Driver is Selected) ── */}
        {selectedDriver ? (
          <>
            {/* ── Section 2: Two Column Reconciliation Cards ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-fade-in">
              
              {/* ==================== LEFT COLUMN: SHIFT SALES RECONCILIATION ==================== */}
              <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden">
                <div className="bg-brand-primary text-white px-4 py-2.5 font-900 text-[12px] uppercase tracking-wider flex items-center justify-between">
                  <span>Shift Sales Reconciliation</span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-700">Excel Sync</span>
                </div>

                <table className="w-full text-left text-[12px]">
                  <tbody className="divide-y divide-neutral-200/60 font-650">
                    <tr>
                      <td className="py-2.5 px-4 text-neutral-700">Total orders</td>
                      <td className="py-2.5 px-4 text-right font-800 text-neutral-900">{calculations.totalOrders}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 text-neutral-700">Total cancels</td>
                      <td className="py-2.5 px-4 text-right font-800 text-neutral-900">{calculations.totalCancels}</td>
                    </tr>

                    <tr className="bg-neutral-100/80 font-800 text-neutral-900 border-t border-neutral-200">
                      <td className="py-2.5 px-4 uppercase text-[11px] tracking-wide">Total sales</td>
                      <td className="py-2.5 px-4 text-right text-emerald-700 font-900">${calculations.totalSales.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-neutral-600 pl-6">Prepaid sales (-)</td>
                      <td className="py-2 px-4 text-right font-700 text-rose-600">-${calculations.prepaidSales.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-neutral-600 pl-6">Prepaid Tips (-)</td>
                      <td className="py-2 px-4 text-right font-700 text-rose-600">-${calculations.prepaidTips.toFixed(2)}</td>
                    </tr>

                    <tr className="bg-orange-50/60 font-900 text-neutral-900 border-y border-brand-primary/20">
                      <td className="py-2.5 px-4 uppercase text-[11px] tracking-wide">Total new sales (=)</td>
                      <td className="py-2.5 px-4 text-right text-brand-primary font-900">${calculations.totalNewSales.toFixed(2)}</td>
                    </tr>

                    <tr>
                      <td className="py-2 px-4 text-neutral-600 pl-6">Terminal sales (-)</td>
                      <td className="py-2 px-4 text-right font-700 text-rose-600">-${calculations.terminalSales.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-neutral-600 pl-6">Terminal Tips (-)</td>
                      <td className="py-2 px-4 text-right font-700 text-rose-600">-${calculations.terminalTips.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 text-neutral-600 pl-6">Cash Sales (-)</td>
                      <td className="py-2 px-4 text-right font-700 text-rose-600">-${calculations.cashSales.toFixed(2)}</td>
                    </tr>

                    <tr className="bg-neutral-900 text-white font-900">
                      <td className="py-2.5 px-4 uppercase text-[11px] tracking-wide">Sale Due (=)</td>
                      <td className="py-2.5 px-4 text-right text-emerald-400 font-900 text-sm">${calculations.saleDue.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ==================== RIGHT COLUMN: DRIVER SETTLEMENT PAYOUT ==================== */}
              <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="bg-brand-primary text-white px-4 py-2.5 font-900 text-[12px] uppercase tracking-wider flex items-center justify-between">
                    <span>Driver Settlement Payout</span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-700">$6.00 / Delivery Order</span>
                  </div>

                  <table className="w-full text-left text-[12px]">
                    <tbody className="divide-y divide-neutral-200/60 font-650">
                      <tr>
                        <td className="py-2.5 px-4 text-neutral-800 font-700">Driver Base Commission ($6.00 / Order)</td>
                        <td className="py-2.5 px-4 text-right font-800 text-brand-primary">${calculations.driverBaseCommission.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-neutral-700">Prepaid Tips</td>
                        <td className="py-2.5 px-4 text-right font-700 text-neutral-900">${calculations.prepaidTips.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-neutral-700">Terminal Tips</td>
                        <td className="py-2.5 px-4 text-right font-700 text-neutral-900">${calculations.terminalTips.toFixed(2)}</td>
                      </tr>

                      <tr className="bg-orange-50/60 font-900 text-neutral-900 border-y border-brand-primary/20">
                        <td className="py-2.5 px-4 uppercase text-[11px] tracking-wide">Total Driver Earnings (Comm + Tips)</td>
                        <td className="py-2.5 px-4 text-right text-brand-primary font-900">${calculations.totalDriverEarning.toFixed(2)}</td>
                      </tr>

                      <tr>
                        <td className="py-2.5 px-4 text-rose-700 font-700">- Less Cash Kept by Driver (Cash Sales)</td>
                        <td className="py-2.5 px-4 text-right font-800 text-rose-600">-${calculations.cashSales.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Net Payout Callout Footer Box */}
                <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-800 uppercase text-neutral-500 tracking-wider">Net Cash Payout to Driver</p>
                    <p className="text-2xl font-900 text-emerald-700 mt-0.5">${calculations.netCashPayoutToDriver.toFixed(2)}</p>
                  </div>

                  <button 
                    onClick={() => setActivePrintModal("both")}
                    className="px-5 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white font-850 text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-95 hover:shadow-sm select-none"
                  >
                    <Printer size={14} />
                    <span>Print Both Slips</span>
                  </button>
                </div>
              </div>

            </div>

            {/* ── Section 3: Enter the Drop Below Section ── */}
            <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden animate-fade-in">
              <div className="bg-brand-primary text-white px-4 py-2.5 font-900 text-[12px] uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Wallet size={15} />
                  <span>ENTER THE DROP BELOW</span>
                </span>
                <span className="text-[10px] font-700 text-white/80">
                  Total Drop Entered: <strong className="text-white">${calculations.totalEnteredDrop.toFixed(2)}</strong>
                </span>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs font-700">
                  
                  {/* Cash Input */}
                  <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-1.5">
                    <label className="text-neutral-700 font-800 uppercase block text-[11px]">Cash</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
                      <input 
                        type="number"
                        step="0.01"
                        value={dropCash}
                        onChange={(e) => setDropCash(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-lg pl-7 pr-3 py-2 text-left font-900 text-neutral-900 focus:outline-none focus:border-brand-primary font-mono text-sm shadow-2xs transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>

                  {/* Credit Card Input */}
                  <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-1.5">
                    <label className="text-neutral-700 font-800 uppercase block text-[11px]">Credit Card</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
                      <input 
                        type="number"
                        step="0.01"
                        value={dropCreditCard}
                        onChange={(e) => setDropCreditCard(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-lg pl-7 pr-3 py-2 text-left font-900 text-neutral-900 focus:outline-none focus:border-brand-primary font-mono text-sm shadow-2xs transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>

                  {/* Other Input */}
                  <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 space-y-1.5">
                    <label className="text-neutral-700 font-800 uppercase block text-[11px]">Other</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
                      <input 
                        type="number"
                        step="0.01"
                        value={dropOther}
                        onChange={(e) => setDropOther(e.target.value)}
                        className="w-full bg-white border border-neutral-300 rounded-lg pl-7 pr-3 py-2 text-left font-900 text-neutral-900 focus:outline-none focus:border-brand-primary font-mono text-sm shadow-2xs transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>

                </div>

                {/* Total Due Row */}
                <div className="bg-neutral-100/70 p-3.5 rounded-xl border border-neutral-200 flex items-center justify-between">
                  <span className="font-900 text-neutral-900 uppercase text-xs">TOTAL DUE</span>
                  <span className="font-900 text-brand-primary text-lg font-mono">${calculations.saleDue.toFixed(2)}</span>
                </div>

                {/* Bottom Action Bar */}
                <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200">
                  <button 
                    onClick={handleCancelDropInputs}
                    className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-800 text-[11px] uppercase rounded-xl transition-all cursor-pointer"
                  >
                    CANCEL
                  </button>

                  <button 
                    onClick={handleOpenSettlement}
                    disabled={isSubmitDisabled}
                    className={`px-6 py-2.5 font-900 text-[12px] uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 ${
                      isSubmitDisabled
                        ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed opacity-60'
                        : 'bg-[#851532] hover:bg-[#6b0f27] text-white cursor-pointer active:scale-95'
                    }`}
                  >
                    {isSubmitDisabled && <Lock size={13} />}
                    <span>SUBMIT (CLOSE DRIVER)</span>
                  </button>
                </div>
              </div>

            </div>

            {/* ── Section 4: Delivered Orders Breakdown Table ── */}
            <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden animate-fade-in">
              <div className="bg-brand-primary text-white px-4 py-2.5 font-900 text-[12px] uppercase tracking-wider flex items-center justify-between">
                <span>Delivered Orders Breakdown</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-700">{orders.length} Orders</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="bg-neutral-100/80 text-neutral-600 font-800 text-[10px] uppercase tracking-wider border-b border-neutral-200/80">
                      <th className="py-2.5 px-4">Ticket / Order Name</th>
                      <th className="py-2.5 px-4">Customer & Address</th>
                      <th className="py-2.5 px-4 text-center">Time</th>
                      <th className="py-2.5 px-4 text-right">Total ($)</th>
                      <th className="py-2.5 px-4 text-right">DC ($)</th>
                      <th className="py-2.5 px-4 text-center">Payment Detail (PD)</th>
                      <th className="py-2.5 px-4 text-right">Tip ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200/60 font-650 text-neutral-800">
                    {orders.length > 0 ? (
                      orders.map((o) => (
                        <tr key={o.id} className="hover:bg-neutral-50/70">
                          <td className="py-2.5 px-4 font-800 text-neutral-900">{o.ticketName}</td>
                          <td className="py-2.5 px-4">
                            <p className="font-700 text-neutral-900">{o.customerName}</p>
                            <p className="text-[11px] text-neutral-500 font-500">{o.address}</p>
                          </td>
                          <td className="py-2.5 px-4 text-center text-neutral-500">{o.time}</td>
                          <td className="py-2.5 px-4 text-right font-800 text-neutral-900">${o.total.toFixed(2)}</td>
                          <td className="py-2.5 px-4 text-right font-800 text-brand-primary">${o.dc.toFixed(2)}</td>
                          <td className="py-2.5 px-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-800 uppercase tracking-wider ${
                              o.pd === 'PP' 
                                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                : o.pd === 'TM'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {o.pd === 'PP' ? 'PP (Prepaid)' : o.pd === 'TM' ? 'TM (Terminal)' : 'CS (Cash)'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right font-700 text-neutral-700">
                            ${(o.prepaidTip + o.terminalTip).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-6 px-4 text-center text-neutral-400 font-600 text-xs">
                          No delivered orders found for this driver.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* Empty State Section when NO Driver is Selected */
          <div className="bg-white border border-neutral-200 rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-brand-primary-light text-brand-primary flex items-center justify-center border border-brand-primary-muted shadow-xs">
              <Truck size={32} />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h2 className="text-base font-900 text-neutral-900 uppercase tracking-wide">Select a Driver to View Shift Drop</h2>
              <p className="text-xs text-neutral-500 font-500 leading-relaxed">
                Choose an active driver from the selection panel above or search by Driver ID (e.g. <strong>6</strong> or <strong>DRV-006</strong>) to load shift reconciliation, calculate driver earnings, and perform cash drop settlement.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* ── 1. SETTLEMENT PAYOUT CONFIRMATION POPUP MODAL ── */}
      {isSettlementModalOpen && selectedDriver && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in font-sans select-none">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-neutral-200 shadow-2xl overflow-hidden animate-scale-up">
            
            {/* Header in Burgundy #851532 */}
            <div className="bg-[#851532] px-6 py-4 flex items-center justify-between text-white">
              <div>
                <h3 className="font-900 text-sm uppercase tracking-wide leading-none">
                  Employee Sales Information & Settlement
                </h3>
                <p className="text-[11px] font-700 text-white/80 mt-1">
                  Driver: #{selectedDriver.id} - {selectedDriver.name}
                </p>
              </div>
              <button 
                onClick={() => setIsSettlementModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs font-700 bg-white text-neutral-800">
              
              <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <span className="text-neutral-700 font-800 uppercase">Commission Due ($6/order)</span>
                <div className="flex items-center gap-3">
                  <span className="bg-white px-3.5 py-1 rounded-lg border border-neutral-300 font-900 text-brand-primary text-sm font-mono shadow-2xs">
                    ${calculations.driverBaseCommission.toFixed(2)}
                  </span>
                  <span className="text-neutral-500 font-800 text-[11px]">
                    Orders: {calculations.totalOrders}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <span className="text-neutral-700 font-800 uppercase">Prepaid & Terminal Tips Due</span>
                <span className="bg-white px-3.5 py-1 rounded-lg border border-neutral-300 font-900 text-neutral-900 text-sm font-mono shadow-2xs">
                  ${calculations.totalTipsEarned.toFixed(2)}
                </span>
              </div>

              {/* Additional Commission Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-neutral-800 font-800 uppercase">ADDITIONAL COMMISSION?</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setHasAdditionalCommissionToggle(true)}
                    className={`px-5 py-1.5 rounded-lg font-900 text-xs cursor-pointer transition-all ${
                      hasAdditionalCommissionToggle ? 'bg-emerald-600 text-white shadow-xs' : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button 
                    onClick={() => setHasAdditionalCommissionToggle(false)}
                    className={`px-5 py-1.5 rounded-lg font-900 text-xs cursor-pointer transition-all ${
                      !hasAdditionalCommissionToggle ? 'bg-rose-600 text-white shadow-xs' : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Conditional Inputs: Shown only if Toggle = Yes */}
              {hasAdditionalCommissionToggle && (
                <>
                  {/* Additional Commission Input */}
                  <div className="space-y-1 pt-1 animate-fade-in">
                    <label className="text-neutral-700 font-800 text-xs block uppercase">Additional Commission ($)</label>
                    <input 
                      type="number"
                      step="0.01"
                      value={additionalCommission}
                      onChange={(e) => setAdditionalCommission(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3.5 py-2 text-neutral-900 font-900 text-sm font-mono focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                    />
                  </div>

                  {/* Reason Text Input */}
                  <div className="space-y-1 animate-fade-in">
                    <label className="text-neutral-700 font-800 text-xs block uppercase">Reason (Why additional commission is given)</label>
                    <input 
                      type="text"
                      placeholder="e.g. Rain Allowance"
                      value={additionalReason}
                      onChange={(e) => setAdditionalReason(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-300 rounded-lg px-3.5 py-2 text-neutral-900 text-xs font-600 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                    />
                  </div>
                </>
              )}

              {/* Total Driver Earning Callout */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-neutral-900 font-900">
                <span className="text-xs uppercase text-amber-900">Total Driver Earning (Tips + Comm):</span>
                <span className="text-brand-primary text-lg font-mono font-900">${calculations.totalDriverEarning.toFixed(2)}</span>
              </div>

            </div>

            {/* Footer Buttons in Clean Theme */}
            <div className="bg-neutral-50 px-6 py-4 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsSettlementModalOpen(false)}
                className="px-5 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-xs font-800 uppercase rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleFinalizeSettlement}
                className="px-6 py-2 bg-[#851532] hover:bg-[#6b0f27] text-white font-900 text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Check size={15} />
                <span>Done & Print Receipts</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── 2. VIEW SALES DETAILS MODAL ── */}
      {isSalesDetailsModalOpen && selectedDriver && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
            
            <div className="bg-brand-primary text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-800 text-[13px] uppercase tracking-wide flex items-center gap-2">
                <FileText size={16} />
                <span>Sales Details - Driver #{selectedDriver.id} ({selectedDriver.name})</span>
              </h3>
              <button 
                type="button"
                onClick={() => setIsSalesDetailsModalOpen(false)}
                className="text-white hover:text-white/80 cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="bg-neutral-100/80 text-neutral-600 font-800 text-[10px] uppercase tracking-wider border-b border-neutral-200">
                    <th className="py-2.5 px-4">Ticket Name</th>
                    <th className="py-2.5 px-4">Customer & Address</th>
                    <th className="py-2.5 px-4 text-center">Time</th>
                    <th className="py-2.5 px-4 text-right">Total ($)</th>
                    <th className="py-2.5 px-4 text-right">DC ($)</th>
                    <th className="py-2.5 px-4 text-center">PD</th>
                    <th className="py-2.5 px-4 text-right">Tip ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/60 font-650">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-neutral-50/70">
                      <td className="py-2.5 px-4 font-800 text-neutral-900">{o.ticketName}</td>
                      <td className="py-2.5 px-4">
                        <p className="font-700 text-neutral-900">{o.customerName}</p>
                        <p className="text-[11px] text-neutral-500 font-500">{o.address}</p>
                      </td>
                      <td className="py-2.5 px-4 text-center text-neutral-500">{o.time}</td>
                      <td className="py-2.5 px-4 text-right font-800 text-neutral-900">${o.total.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-right font-800 text-brand-primary">${o.dc.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-800 uppercase ${
                          o.pd === 'PP' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {o.pd}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-700 text-neutral-700">${(o.prepaidTip + o.terminalTip).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-neutral-50 border-t border-neutral-200 p-4 flex justify-end">
              <button 
                onClick={() => setIsSalesDetailsModalOpen(false)}
                className="px-5 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-[11px] font-800 uppercase rounded-lg transition-all cursor-pointer"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── 3. THERMAL PRINT PREVIEW MODAL ── */}
      {activePrintModal && selectedDriver && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scale-up border border-neutral-200">
            <div className="bg-brand-primary text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-800 text-[13px] uppercase tracking-wide flex items-center gap-2">
                <Printer size={16} />
                <span>Slip Preview</span>
              </h3>
              <button 
                type="button"
                onClick={() => setActivePrintModal(null)}
                className="text-white hover:text-white/80 cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            <div className="p-6 bg-neutral-100 max-h-[70vh] overflow-y-auto flex flex-col items-center space-y-6">
              {(activePrintModal === "sales" || activePrintModal === "both") && (
                <div className="w-full">
                  <p className="text-[11px] font-800 text-neutral-600 text-center uppercase tracking-wider mb-2">1. Employee Sales Report Slip</p>
                  <ThermalDriverSalesReport data={salesReportData} />
                </div>
              )}

              {(activePrintModal === "commission" || activePrintModal === "both") && (
                <div className="w-full">
                  <p className="text-[11px] font-800 text-neutral-600 text-center uppercase tracking-wider mb-2">2. Driver Commission Settlement Slip</p>
                  <ThermalDriverCommissionSlip data={commissionSlipData} />
                </div>
              )}
            </div>

            <div className="bg-neutral-50 border-t border-neutral-200 p-4 flex items-center justify-between select-none">
              <span className="text-[11px] font-600 text-neutral-500">Slip Printer Ready</span>
              <div className="flex items-center gap-2.5">
                <button 
                  type="button"
                  onClick={() => setActivePrintModal(null)}
                  className="px-5 py-1.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-[11px] font-800 uppercase rounded-lg transition-all cursor-pointer"
                >
                  Close
                </button>
                <button 
                  type="button"
                  onClick={handleTriggerPrint}
                  className="px-5 py-1.5 bg-brand-primary text-white text-[11px] font-800 uppercase rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:bg-brand-primary/90"
                >
                  <Printer size={14} />
                  <span>Print Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POS Sidebar Drawer */}
      <POSSidebarDrawer 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        activeTab="driver_drop"
        onSelectTab={(tab) => {
          if (tab !== 'driver_drop') {
            window.location.href = `/employee/orders?tab=${tab}`;
          }
        }}
      />
    </main>
  );
}
