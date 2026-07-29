'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import PosNavbar from '@/modules/employee-pos/components/PosNavbar';
import POSSidebarDrawer from '@/modules/employee-pos/components/POSSidebarDrawer';
import {
  ShieldCheck, Users, RefreshCw, Save, Search,
  Shield, ChefHat, Truck, DollarSign, UserCheck,
  CheckSquare, Square, Check
} from 'lucide-react';

// ─── Permission Definitions ───────────────────────────────────────────────────
interface PermissionDef {
  key: string;
  label: string;
  shortLabel: string;
  description: string;
  group: string;
  alwaysOn?: boolean;
}

const PERMISSION_DEFS: PermissionDef[] = [
  // Always On
  { key: 'pos',                   label: 'POS Terminal',          shortLabel: 'POS',          description: 'Access ordering / POS terminal',            group: 'Always On',   alwaysOn: true },
  // POS Routes
  { key: 'kitchen',               label: 'Kitchen View',          shortLabel: 'Kitchen',      description: 'Kitchen display & ticket queue',             group: 'POS Routes' },
  { key: 'reception_view',        label: 'Reception View',        shortLabel: 'Reception',    description: 'Live order reception & handover tracking',   group: 'POS Routes' },
  { key: 'delivery',              label: 'Delivery',              shortLabel: 'Delivery',     description: 'Manage active delivery orders',             group: 'POS Routes' },
  { key: 'driver_drop',           label: 'Driver Drop',           shortLabel: 'Driver Drop',  description: 'Manage driver drop-offs',                   group: 'POS Routes' },
  { key: 'vehicles',              label: 'Vehicle Number',        shortLabel: 'Vehicles',     description: 'Register & manage vehicle numbers',        group: 'POS Routes' },
  { key: 'customers',             label: 'Customers',             shortLabel: 'Customers',    description: 'View & manage customer profiles',          group: 'POS Routes' },
  { key: 'employees',             label: 'Employee Management',   shortLabel: 'Employees',    description: 'Create, edit & deactivate employees',      group: 'POS Routes' },
  { key: 'menus',                 label: 'Menus',                 shortLabel: 'Menus',        description: 'Manage menu items & categories',           group: 'POS Routes' },
  { key: 'setting',               label: 'Settings',              shortLabel: 'Settings',     description: 'Access branch settings',                  group: 'POS Routes' },
  // Orders Page Sub-Tabs
  { key: 'dashboard',             label: 'Dashboard',             shortLabel: 'Dashboard',    description: 'View dashboard metrics & analytics',        group: 'Orders Page' },
  { key: 'orders',                label: 'Orders',                shortLabel: 'Orders',       description: 'View & manage order list',                group: 'Orders Page' },
  { key: 'sales_summary',         label: 'Sales Summary',         shortLabel: 'Sales Sum.',   description: 'Daily sales summary breakdown',           group: 'Orders Page' },
  { key: 'expense_payout',        label: 'Expense / Payout',      shortLabel: 'Expenses',     description: 'Record expenses and staff payouts',        group: 'Orders Page' },
  { key: 'reports',               label: 'Reports',               shortLabel: 'Reports',      description: 'Full sales & financial reports',            group: 'Orders Page' },
  { key: 'item_sales',            label: 'Item Sales',            shortLabel: 'Item Sales',   description: 'Per-item sales breakdown',                group: 'Orders Page' },
  { key: 'hourly_sales',          label: 'Hourly Sales',          shortLabel: 'Hourly',       description: 'Hourly sales report',                     group: 'Orders Page' },
  { key: 'cash_out_summary',      label: 'Cash Out Summary',      shortLabel: 'Cash Out',     description: 'Cash-out summary report',                group: 'Orders Page' },
  { key: 'monthly_sales_summary', label: 'Monthly Sales',         shortLabel: 'Monthly',      description: 'Monthly sales summary',                  group: 'Orders Page' },
  { key: 'failed_transaction',    label: 'Failed Transactions',   shortLabel: 'Failed Tx',    description: 'Review failed & cancelled transactions',   group: 'Orders Page' },
  { key: 'refund_orders',         label: 'Refund Orders',         shortLabel: 'Refunds',      description: 'View & process refund orders',            group: 'Orders Page' },
];

const GROUPS = [
  { name: 'Always On', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'POS Routes', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { name: 'Orders Page', color: 'bg-blue-50 text-blue-700 border-blue-200' },
];

interface EmployeePermissions {
  [key: string]: boolean;
}

interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  role: string;
  isActive: boolean;
  permissions?: EmployeePermissions;
}

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'manager':    return { cls: 'bg-purple-50 text-purple-700 border-purple-200', label: 'Manager',     Icon: Shield };
    case 'supervisor': return { cls: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Supervisor',  Icon: Shield };
    case 'chef':       return { cls: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Chef',        Icon: ChefHat };
    case 'driver':     return { cls: 'bg-blue-50 text-blue-700 border-blue-200',       label: 'Driver',      Icon: Truck };
    case 'cashier':    return { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Cashier',  Icon: DollarSign };
    default:           return { cls: 'bg-neutral-100 text-neutral-700 border-neutral-200', label: 'Crew',    Icon: UserCheck };
  }
};

const buildDefaultPermissions = (): EmployeePermissions => {
  const defaults: EmployeePermissions = {};
  PERMISSION_DEFS.forEach(p => {
    defaults[p.key] = p.alwaysOn === true;
  });
  return defaults;
};

const mergePermissions = (saved?: EmployeePermissions): EmployeePermissions => {
  const base = buildDefaultPermissions();
  if (!saved) return base;
  return { ...base, ...saved };
};

export default function PermissionsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [localPerms, setLocalPerms] = useState<{ [empId: string]: EmployeePermissions }>({});

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const getBranchId = () => {
    if (typeof window === 'undefined') return null;
    try {
      const b = JSON.parse(localStorage.getItem('rms_branch') || '{}');
      return b._id || null;
    } catch { return null; }
  };

  const fetchEmployees = useCallback(async () => {
    const branchId = getBranchId();
    if (!branchId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/employees`, { params: { branchId } });
      if (res.data?.success) {
        const emps: Employee[] = res.data.data;
        setEmployees(emps);
        const permsMap: { [empId: string]: EmployeePermissions } = {};
        emps.forEach(emp => {
          permsMap[emp._id] = mergePermissions(emp.permissions as EmployeePermissions | undefined);
        });
        setLocalPerms(permsMap);
      }
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleToggle = (empId: string, permKey: string) => {
    setLocalPerms(prev => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        [permKey]: !prev[empId]?.[permKey],
      },
    }));
  };

  const handleSelectAll = (empId: string, select: boolean) => {
    const newPerms: EmployeePermissions = {};
    PERMISSION_DEFS.forEach(p => {
      newPerms[p.key] = p.alwaysOn ? true : select;
    });
    setLocalPerms(prev => ({ ...prev, [empId]: newPerms }));
  };

  const handleSave = async (emp: Employee) => {
    const branchId = getBranchId();
    if (!branchId) { toast.error('Branch session invalid'); return; }
    setSavingId(emp._id);
    try {
      await axios.patch(
        `${apiUrl}/employees/${emp._id}/permissions`,
        { permissions: localPerms[emp._id], branchId },
      );
      toast.success(`Permissions saved for ${emp.name}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save permissions');
    } finally {
      setSavingId(null);
    }
  };

  const filtered = employees.filter(emp => {
    const q = searchQuery.toLowerCase();
    return (
      emp.name.toLowerCase().includes(q) ||
      emp.employeeId.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="h-screen w-screen max-w-full overflow-hidden bg-neutral-50 flex flex-col font-sans">
      {/* Navbar */}
      <PosNavbar onToggleSidebar={() => setIsSidebarOpen(true)} />

      {/* Sidebar */}
      <POSSidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab="permissions"
        onSelectTab={() => {}}
      />

      {/* Top Controls Header Bar */}
      <div className="bg-white border-b border-neutral-200 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs shrink-0 select-none w-full max-w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center">
            <ShieldCheck size={18} className="text-brand-primary" />
          </div>
          <div>
            <h1 className="text-sm font-900 text-neutral-900 leading-tight">Employee Permissions Matrix</h1>
            <p className="text-[10.5px] text-neutral-500 font-500">
              Manage tab and feature access control per staff member
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-1.5 text-xs border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:outline-none focus:border-brand-primary/50 w-52 font-500 transition-all"
            />
          </div>
          <button
            onClick={fetchEmployees}
            className="p-1.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
            title="Reload Employees"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Content Body - STRICT OVERFLOW CONTROL */}
      <div className="flex-1 min-h-0 w-full max-w-full p-4 sm:p-6 overflow-hidden flex flex-col">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-neutral-400">
            <div className="w-8 h-8 border-3 border-neutral-200 border-t-brand-primary rounded-full animate-spin" />
            <span className="text-xs font-700">Loading Permissions Matrix...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-neutral-400">
            <Users size={32} className="opacity-40" />
            <p className="text-xs font-700">No employees found</p>
          </div>
        ) : (
          /* Table Wrapper Card - Only THIS element handles horizontal & vertical scrolling */
          <div className="flex-1 min-h-0 w-full max-w-full bg-white border border-neutral-200 rounded-2xl shadow-xs overflow-auto flex flex-col">
            <table className="w-full text-left border-collapse min-w-[1300px] relative">
              <thead>
                {/* Category Headers Row */}
                <tr className="bg-neutral-100/90 border-b border-neutral-200 text-[10px] font-900 uppercase tracking-wider text-neutral-600 select-none sticky top-0 z-30">
                  <th className="px-4 py-2 sticky left-0 top-0 z-40 bg-neutral-100 border-r border-neutral-200/80 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] min-w-[210px]">
                    Staff Details
                  </th>
                  <th className="px-3 py-2 text-center bg-emerald-50/80 text-emerald-800 border-r border-neutral-200/80 min-w-[80px]" colSpan={1}>
                    Always On
                  </th>
                  <th className="px-3 py-2 text-center bg-amber-50/80 text-amber-800 border-r border-neutral-200/80" colSpan={PERMISSION_DEFS.filter(p => p.group === 'POS Routes').length}>
                    POS Main Routes
                  </th>
                  <th className="px-3 py-2 text-center bg-blue-50/80 text-blue-800 border-r border-neutral-200/80" colSpan={PERMISSION_DEFS.filter(p => p.group === 'Orders Page').length}>
                    Orders Page Sub-Tabs
                  </th>
                  <th className="px-4 py-2 text-right sticky right-0 top-0 z-40 bg-neutral-100 border-l border-neutral-200/80 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.06)] min-w-[130px]">
                    Actions
                  </th>
                </tr>

                {/* Individual Column Header Row */}
                <tr className="bg-neutral-50 text-[10px] font-800 uppercase tracking-wider text-neutral-600 border-b border-neutral-200 select-none sticky top-[29px] z-30">
                  <th className="px-4 py-2 sticky left-0 z-40 bg-neutral-50 border-r border-neutral-200/80 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    Employee Name & Role
                  </th>
                  {PERMISSION_DEFS.map(perm => (
                    <th
                      key={perm.key}
                      className="px-2 py-2 text-center border-r border-neutral-200/60 font-750 hover:bg-neutral-100 transition-colors"
                      title={`${perm.label}: ${perm.description}`}
                    >
                      <span className="text-[10px] text-neutral-800 whitespace-nowrap">{perm.shortLabel}</span>
                    </th>
                  ))}
                  <th className="px-4 py-2 text-right sticky right-0 z-40 bg-neutral-50 border-l border-neutral-200/80 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                    Save / Toggle
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100 text-xs">
                {filtered.map(emp => {
                  const perms = localPerms[emp._id] || buildDefaultPermissions();
                  const badge = getRoleBadge(emp.role);
                  const BadgeIcon = badge.Icon;
                  const isManager = emp.role === 'manager';
                  const isSaving = savingId === emp._id;
                  const allSelected = PERMISSION_DEFS.every(p => perms[p.key]);

                  return (
                    <tr
                      key={emp._id}
                      className={`hover:bg-neutral-50/80 transition-colors ${
                        isManager ? 'bg-purple-50/15' : ''
                      }`}
                    >
                      {/* Employee Column (Sticky Left) */}
                      <td className="px-4 py-2.5 sticky left-0 z-20 bg-white border-r border-neutral-200/80 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-900 shrink-0 ${
                            isManager ? 'bg-purple-100 text-purple-700' : 'bg-brand-primary/10 text-brand-primary'
                          }`}>
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-800 text-neutral-900 text-xs truncate max-w-[100px]">
                                {emp.name}
                              </span>
                              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md text-[9px] font-800 border shrink-0 ${badge.cls}`}>
                                <BadgeIcon size={8} />
                                {badge.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-neutral-400 font-500 leading-none mt-0.5">
                              ID: {emp.employeeId}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Permission Checkbox Cells */}
                      {PERMISSION_DEFS.map(perm => {
                        const isChecked = isManager ? true : !!perms[perm.key];
                        const isAlwaysOn = perm.alwaysOn === true || isManager;

                        return (
                          <td
                            key={perm.key}
                            className={`px-2 py-2 text-center border-r border-neutral-100 transition-colors ${
                              isChecked ? 'bg-emerald-50/15' : ''
                            }`}
                            title={`${emp.name} → ${perm.label}`}
                          >
                            <div className="flex items-center justify-center">
                              <label className={`inline-flex items-center justify-center p-1 rounded-md transition-all ${
                                isAlwaysOn ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:bg-neutral-100'
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isAlwaysOn}
                                  onChange={() => !isAlwaysOn && handleToggle(emp._id, perm.key)}
                                  className="sr-only"
                                />
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                  isChecked
                                    ? isAlwaysOn
                                      ? 'bg-neutral-400 border-neutral-400'
                                      : 'bg-emerald-600 border-emerald-600 shadow-2xs'
                                    : 'bg-white border-neutral-300 hover:border-neutral-400'
                                }`}>
                                  {isChecked && <Check size={11} strokeWidth={3} className="text-white" />}
                                </div>
                              </label>
                            </div>
                          </td>
                        );
                      })}

                      {/* Actions Column (Sticky Right) */}
                      <td className="px-4 py-2.5 sticky right-0 z-20 bg-white border-l border-neutral-200/80 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.06)] text-right">
                        {isManager ? (
                          <span className="text-[10px] font-800 text-purple-600 bg-purple-50 border border-purple-200 px-2 py-1 rounded-lg">
                            Full Access
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSelectAll(emp._id, !allSelected)}
                              className="p-1 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                              title={allSelected ? "Deselect All" : "Select All"}
                            >
                              {allSelected ? <Square size={13} /> : <CheckSquare size={13} className="text-brand-primary" />}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSave(emp)}
                              disabled={isSaving}
                              className="px-3 py-1 rounded-lg bg-brand-primary hover:bg-orange-600 text-white text-[11px] font-800 flex items-center gap-1 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                            >
                              {isSaving ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <Save size={12} />
                                  <span>Save</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
