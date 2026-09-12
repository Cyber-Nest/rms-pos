'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import PosNavbar from '@/modules/employee-pos/components/PosNavbar';
import CategoryCarousel from '@/modules/employee-pos/components/CategoryCarousel';
import OrderTypePanel from '@/modules/employee-pos/components/OrderTypePanel';
import MenuGrid from '@/modules/employee-pos/components/MenuGrid';
import CartPanel from '@/modules/employee-pos/components/CartPanel';
import ModifierDrawer from '@/modules/employee-pos/components/ModifierDrawer';
import CheckoutModal from '@/modules/employee-pos/components/CheckoutModal';
import POSSidebarDrawer from '@/modules/employee-pos/components/POSSidebarDrawer';
import { MenuItem, CartItem as CartItemType } from '@/modules/employee-pos/types';
import { usePosStore } from '@/modules/employee-pos/store/pos.store';
import OnlineOrderBanner from '@/modules/employee-pos/components/OnlineOrderBanner';
import EmployeePermissionGuard from '@/modules/employee-pos/components/EmployeePermissionGuard';
import { ShoppingBag, X } from 'lucide-react';

export default function PosPage() {
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [editingCartItem, setEditingCartItem] = useState<CartItemType | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { fetchMenu, cartItems, menuItems } = usePosStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rawEditOrder = localStorage.getItem('rms_edit_order');
      if (rawEditOrder) {
        try {
          const editData = JSON.parse(rawEditOrder);
          localStorage.removeItem('rms_edit_order');
          localStorage.removeItem('rms_draft_cart');

          usePosStore.getState().loadOrderForEditing(editData);
        } catch (e) {
          console.error('Failed to load edit order data:', e);
        }
      } else {
        window.localStorage.removeItem('rms_draft_cart');
        window.dispatchEvent(new Event('storage'));
      }
    }
    fetchMenu();
  }, [fetchMenu]);

  const handleOpenModifiers = (item: MenuItem) => {
    setEditingCartItem(null);
    setActiveItem(item);
    setIsDrawerOpen(true);
  };

  const handleEditCartItem = (cartItem: CartItemType) => {
    const menuItem = menuItems.find(
      (m) => m.id === cartItem.menuItemId || m.name === cartItem.name
    ) || ({
      id: cartItem.menuItemId,
      name: cartItem.name,
      price: cartItem.basePrice,
      image: cartItem.image,
      categoryId: cartItem.categoryId,
      modifierGroups: [],
    } as unknown as MenuItem);

    setEditingCartItem(cartItem);
    setActiveItem(menuItem);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setActiveItem(null);
    setEditingCartItem(null);
  };

  return (
    <EmployeePermissionGuard permissionKey="pos">
      <main className="h-screen flex flex-col overflow-hidden bg-neutral-100 text-neutral-900 font-sans">

        {/* Navbar */}
        <PosNavbar onToggleSidebar={() => setIsSidebarOpen(true)} />

        {/* Horizontal Scrollable Categories */}
        <CategoryCarousel />

        {/* ── Main Work Area ──
            Mobile  (<md) : full width menu, cart as bottom sheet FAB
            Tablet  (md)  : menu + right cart panel (no left panel)
            Laptop  (lg+) : 3-column: left panel + menu + cart
        */}
        <div className="flex-1 flex overflow-hidden p-2 md:p-3 gap-2 md:gap-3 min-h-0">

          {/* Left Column – Order Type & Customer (lg+ only) */}
          <div className="hidden lg:flex w-[20%] flex-shrink-0 h-full">
            <OrderTypePanel />
          </div>

          {/* Center Column – Menu Grid */}
          <div
            id="menu-grid-section"
            className="flex-1 lg:w-[55%] lg:flex-none h-full flex flex-col min-w-0"
          >
            <MenuGrid onOpenModifiers={handleOpenModifiers} />
          </div>

          {/* Right Column – Cart (hidden on mobile, visible md+) */}
          <div className="hidden md:flex w-[270px] lg:w-[25%] flex-shrink-0 h-full">
            <CartPanel onEditItem={handleEditCartItem} />
          </div>
        </div>

        {/* ── Mobile: Floating Cart Button (< md) ── */}
        <div className="md:hidden fixed bottom-5 right-4 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative w-14 h-14 bg-brand-primary text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag size={22} />
            {cartItems.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-800 rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm">
                {cartItems.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Mobile: Cart Bottom Sheet ── */}
        {isCartOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsCartOpen(false)}
            />
            {/* Sheet Panel */}
            <div className="relative bg-white rounded-t-3xl shadow-2xl h-[85vh] flex flex-col">
              <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-neutral-100 flex-shrink-0">
                <span className="text-[16px] font-800 text-neutral-900">Current Order</span>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 cursor-pointer hover:bg-neutral-200 transition-all"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <CartPanel onEditItem={handleEditCartItem} />
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Drawer */}
        <POSSidebarDrawer
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab="pos"
          onSelectTab={(tabKey) => {
            if (tabKey === 'orders' || tabKey === 'dashboard' || tabKey === 'sales_summary' || tabKey === 'expense_payout') {
              window.location.href = `/employee/orders?tab=${tabKey}`;
            }
          }}
        />

        {/* Modifier Drawer Overlay */}
        <ModifierDrawer
          item={activeItem}
          editingCartItem={editingCartItem}
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
        />

        {/* Checkout Modal */}
        <CheckoutModal />

        {/* Online Order Banner */}
        <OnlineOrderBanner />
      </main>
    </EmployeePermissionGuard>
  );
}
