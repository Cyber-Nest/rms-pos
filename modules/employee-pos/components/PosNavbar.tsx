'use client';

import React from 'react';
import axios from 'axios';
import { Search, Bell, ChefHat, LayoutGrid, Menu, TrendingUp, ClipboardList, LogOut } from 'lucide-react';
import { usePosStore } from '../store/pos.store';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

interface PosNavbarProps {
  onToggleSidebar?: () => void;
}

export default function PosNavbar({ onToggleSidebar }: PosNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { search, setSearch, orders } = usePosStore();
  const [branchInfo, setBranchInfo] = React.useState<{ name: string; code: string; _id?: string } | null>(null);
  const [loadingBranchInfo, setLoadingBranchInfo] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;
    const loadBranchSession = async () => {
      if (typeof window === 'undefined') return;

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const raw = localStorage.getItem('rms_branch');
      let token = '';

      if (raw) {
        try {
          const b = JSON.parse(raw);
          token = b.token || '';
          if (isMounted && b.name && b.code) {
            setBranchInfo({ name: b.name, code: b.code, _id: b._id });
          }
        } catch (e) {}
      }

      // Try fetching fresh branch profile from backend
      try {
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await axios.get(`${API_URL}/branches/me`, {
          withCredentials: true,
          headers,
        });

        if (res.data.success && res.data.data) {
          const freshData = res.data.data;
          if (isMounted) {
            setBranchInfo({ name: freshData.name, code: freshData.code, _id: freshData._id });
          }
          // Sync localStorage
          if (raw) {
            try {
              const existing = JSON.parse(raw);
              localStorage.setItem('rms_branch', JSON.stringify({ ...existing, ...freshData }));
            } catch (e) {}
          }
        }
      } catch (err: any) {
        // If unauthenticated or branch inactive, force redirect to login
        if (err.response?.status === 401) {
          localStorage.removeItem('rms_branch');
          document.cookie = 'rms_branch_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'rms_branch_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          router.push('/login');
          return;
        }
      } finally {
        if (isMounted) setLoadingBranchInfo(false);
      }

      // If no branch info found at all, redirect to login
      if (!raw) {
        router.push('/login');
      }
    };

    loadBranchSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    if (confirm('Are you sure you want to log out of the branch terminal?')) {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        await axios.post(`${API_URL}/branches/logout`, {}, { withCredentials: true });
      } catch (e) {}

      if (typeof window !== 'undefined') {
        localStorage.removeItem('rms_branch');
        localStorage.removeItem('rms_draft_cart');
        document.cookie = 'rms_branch_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'rms_branch_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
      router.push('/login');
    }
  };

  const navLinks = [
    { name: 'POS Terminal', href: '/employee/pos', icon: LayoutGrid },
    { name: 'Kitchen View', href: '/employee/kitchen', icon: ChefHat },
    { name: 'Orders', href: '/employee/orders', icon: ClipboardList },
    { name: 'Reception View', href: '/employee/reception', icon: TrendingUp },
  ];

  return (
    <header className="h-[64px] bg-white border-b border-neutral-200 px-5 flex items-center justify-between sticky top-0 z-40 shadow-sm font-sans">
      {/* ── Left: Logo + Branch + Nav Links ── */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <Link href="/employee/pos" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-primary rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
            <ChefHat size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="leading-none hidden sm:block">
            <p className="text-[13px] font-900 text-neutral-900 leading-tight tracking-tight">Chicken</p>
            <p className="text-[11px] font-700 text-brand-primary leading-tight tracking-widest uppercase">Delight</p>
          </div>
        </Link>

        {/* Divider */}
        <div className="h-7 w-px bg-neutral-200" />

        {/* Active Branch Badge */}
        {loadingBranchInfo && !branchInfo ? (
          <div className="flex items-center gap-2 bg-orange-50/60 border border-orange-200/60 rounded-xl px-3 py-1.5 shadow-xs animate-pulse">
            <div className="w-8 h-4 bg-orange-200/80 rounded" />
            <div className="w-24 h-4 bg-orange-200/50 rounded" />
          </div>
        ) : branchInfo ? (
          <div className="flex items-center gap-2 bg-orange-50/80 border border-orange-200 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="px-1.5 py-0.5 bg-brand-primary text-white text-[9px] font-900 rounded uppercase flex-shrink-0">
              {branchInfo.code}
            </span>
            <span className="text-[12px] font-800 text-neutral-800 whitespace-nowrap">
              {branchInfo.name}
            </span>
          </div>
        ) : null}

        {/* Divider */}
        <div className="h-5 w-px bg-neutral-200 hidden lg:block" />

        {/* Nav Navigation Links */}
        <div className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href === '/employee/pos' && (pathname === '/' || pathname === '/employee'));
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-700 transition-all cursor-pointer border ${
                  isActive
                    ? 'border-brand-primary/30 bg-brand-primary-light text-brand-primary shadow-xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:border-brand-primary/30 hover:bg-brand-primary-light hover:text-brand-primary'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-brand-primary' : 'text-neutral-500'} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── Center: Global Search (Only shown on POS Terminal page) ── */}
      {pathname === '/employee/pos' && (
        <div className="flex-1 max-w-sm mx-4 hidden md:block">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu items..."
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2 pl-9 pr-3 text-[12px] text-neutral-700 placeholder-neutral-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/15 focus:bg-white transition-all"
            />
          </div>
        </div>
      )}

      {/* ── Right: Actions + Profile + Logout ── */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-500 hover:text-brand-primary hover:border-brand-primary/30 hover:bg-brand-primary-light transition-all cursor-pointer">
          <Bell size={16} />
          {orders.length > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-brand-primary text-white text-[9px] font-700 rounded-full flex items-center justify-center px-1 border border-white">
              {orders.length}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="h-7 w-px bg-neutral-200" />

        {/* Staff Profile */}
        {loadingBranchInfo && !branchInfo ? (
          <div className="w-24 h-8 bg-neutral-100 animate-pulse rounded-xl" />
        ) : branchInfo ? (
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-[12px] font-800 text-neutral-900 leading-tight">
                {branchInfo.code} Staff
              </p>
              <span className="text-[9px] font-700 text-brand-primary leading-tight uppercase tracking-wider">
                Terminal
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center text-[11px] font-900 text-white shadow-xs">
              {branchInfo.code.slice(0, 2)}
            </div>
          </div>
        ) : null}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 hover:text-red-700 hover:border-red-300 transition-all cursor-pointer"
          title="Logout of Terminal"
        >
          <LogOut size={15} />
        </button>

        {/* Menu Drawer Toggle Button */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-brand-primary text-white hover:bg-orange-600 transition-all cursor-pointer shadow-xs ml-1"
            title="Open Menu Drawer"
          >
            <Menu size={18} />
          </button>
        )}
      </div>
    </header>
  );
}

