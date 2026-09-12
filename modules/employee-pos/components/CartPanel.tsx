"use client";

import React from "react";
import {
  ShoppingBag,
  Users,
  Trash2,
  Plus,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { usePosStore } from "../store/pos.store";
import CartItem from "./CartItem";
import { CartItem as CartItemType } from "../types";

interface CartPanelProps {
  onEditItem?: (item: CartItemType) => void;
}

export default function CartPanel({ onEditItem }: CartPanelProps = {}) {
  const {
    cartItems,
    selectedCustomer,
    subtotal,
    tax,
    discount,
    total,
    clearCart,
    openCheckout,
    nextOrderNumber,
    branchTaxFees,
    editingOrderId,
    editingOrderNumber,
    cancelEditingOrder,
  } = usePosStore();

  const activeTaxRatePercent =
    (branchTaxFees?.gstTaxRate ?? 5) +
    (branchTaxFees?.pstTaxRate ?? 0) +
    (branchTaxFees?.hstTaxRate ?? 0);

  const orderNum = editingOrderId ? editingOrderNumber : nextOrderNumber;

  const validate = () => {
    if (!cartItems.length) {
      toast.error("Cart is empty.");
      return false;
    }
    return true;
  };

  const handleCreate = () => {
    if (!validate()) return;
    openCheckout();
  };

  const handleClearCart = () => {
    if (!cartItems.length) return;
    if (editingOrderId) {
      cancelEditingOrder();
      return;
    }
    toast(
      (t) => (
        <div className="flex flex-col gap-2 font-sans">
          <span className="text-[12px] font-600 text-neutral-800">
            Clear all items from current order cart?
          </span>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-2.5 py-1 text-[11px] font-600 text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                clearCart();
                toast.dismiss(t.id);
                toast.success("Cart cleared");
              }}
              className="px-2.5 py-1 text-[11px] font-600 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              Yes, Clear
            </button>
          </div>
        </div>
      ),
      {
        duration: 8000,
      },
    );
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 flex flex-col h-full overflow-hidden select-none w-full">
      {/* ── Header ── */}
      <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${editingOrderId ? "bg-amber-50/80 border-amber-200" : "border-neutral-100"}`}>
        <div>
          <h3 className={`text-[13px] md:text-[14px] font-700 leading-tight ${editingOrderId ? "text-amber-900" : "text-neutral-900"}`}>
            {editingOrderId ? "Editing Order" : "Current Order"}
          </h3>
          <span className={`text-[11px] md:text-[12px] font-600 tracking-wide mt-0.5 block ${editingOrderId ? "text-amber-800 font-700" : "text-brand-primary"}`}>
            {orderNum}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-neutral-100 px-2 py-0.5 rounded-md">
            <Users size={10} className="text-neutral-500" />
            <span className="text-[10px] font-700 text-neutral-600">
              {selectedCustomer ? 1 : 0}
            </span>
          </div>
          <button
            onClick={handleClearCart}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
              editingOrderId
                ? "text-amber-700 hover:text-red-600 hover:bg-amber-100"
                : "text-neutral-400 hover:text-red-500 hover:bg-red-50"
            }`}
            title={editingOrderId ? "Discard edits" : "Clear cart"}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* ── Cart Items ── */}
      <div className="flex-1 overflow-y-auto px-4 min-h-0">
        {cartItems.length > 0 ? (
          <div className="py-1">
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} onEdit={onEditItem} />
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center py-8 text-center">
            <div className="w-14 h-14 bg-neutral-50 border border-neutral-200 rounded-full flex items-center justify-center mb-3">
              <ShoppingBag size={22} className="text-neutral-300" />
            </div>
            <h4 className="text-[12px] md:text-[13px] font-600 text-neutral-600">
              Cart is empty
            </h4>
            <p className="text-[10px] md:text-[11px] text-neutral-400 mt-1 leading-normal">
              Select items from the menu
            </p>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-neutral-100 px-4 py-3 space-y-2.5 flex-shrink-0">
        {/* Add More */}
        <button
          onClick={() =>
            document
              .getElementById("menu-grid-section")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="w-full py-2 rounded-lg border border-dashed border-neutral-300 text-neutral-500 hover:border-brand-primary hover:text-brand-primary text-[10px] md:text-[11px] font-600 flex items-center justify-center gap-1.5 hover:bg-orange-50/30 transition-all cursor-pointer"
        >
          <Plus size={11} />
          Add More Items
        </button>

        {/* Totals */}
        <div className="space-y-1.5">
          {[
            {
              label: "Subtotal",
              value: `$${subtotal.toFixed(2)}`,
              cls: "text-neutral-700",
            },
            {
              label: `Tax (${activeTaxRatePercent}%)`,
              value: `$${tax.toFixed(2)}`,
              cls: "text-neutral-500",
            },
            ...(discount > 0
              ? [
                  {
                    label: "Discount",
                    value: `-$${discount.toFixed(2)}`,
                    cls: "text-green-600",
                  },
                ]
              : []),
          ].map(({ label, value, cls }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[11px] md:text-[12px] font-500 text-neutral-500">
                {label}
              </span>
              <span className={`text-[11px] md:text-[12px] font-600 ${cls}`}>{value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-1.5 border-t border-neutral-100 mt-1">
            <span className="text-[12px] md:text-[13px] font-700 text-neutral-900 uppercase tracking-wide">
              Total
            </span>
            <span className="text-[15px] md:text-[16px] font-800 text-brand-primary">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-1.5 pt-0.5">
          <button
            onClick={handleCreate}
            disabled={!cartItems.length}
            className={`w-full py-3 rounded-xl text-[12px] md:text-[13px] font-700 flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.99] cursor-pointer ${
              cartItems.length
                ? editingOrderId
                  ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20"
                  : "bg-brand-primary text-white hover:bg-brand-primary-hover shadow-brand-primary/20"
                : "bg-neutral-100 text-neutral-400 cursor-not-allowed shadow-none"
            }`}
          >
            {editingOrderId ? "Update Order" : "Create Order"} <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
