'use client';

import React, { useMemo } from 'react';
import { Plus, Minus, Trash2, Pencil } from 'lucide-react';
import { CartItem as CartItemType, SelectedModifier } from '../types';
import { usePosStore } from '../store/pos.store';

interface CartItemProps {
  item: CartItemType;
  onEdit?: (item: CartItemType) => void;
}

function getFormattedModifierList(selectedModifiers: SelectedModifier[]): string[] {
  if (!selectedModifiers || selectedModifiers.length === 0) return [];

  const rootMods: SelectedModifier[] = [];
  const childMods: SelectedModifier[] = [];

  selectedModifiers.forEach((m) => {
    if (m.isRoot !== false && !m.parentOptionName && (!m.groupName || !m.groupName.includes('›'))) {
      rootMods.push(m);
    } else {
      childMods.push(m);
    }
  });

  const childrenByParent = new Map<string, SelectedModifier[]>();

  childMods.forEach((c) => {
    let parentKey = c.parentOptionId || c.parentOptionName;
    if (!parentKey && c.groupName && c.groupName.includes('›')) {
      const parts = c.groupName.split('›').map((s) => s.trim());
      parentKey = parts[0];
    }

    if (!parentKey && rootMods.length > 0) {
      parentKey = rootMods[rootMods.length - 1].optionId || rootMods[rootMods.length - 1].optionName;
    }

    const key = parentKey || 'other';
    if (!childrenByParent.has(key)) {
      childrenByParent.set(key, []);
    }
    childrenByParent.get(key)!.push(c);
  });

  const resultLines: string[] = [];
  const processedChildKeys = new Set<string>();

  selectedModifiers.forEach((m) => {
    const childList =
      childrenByParent.get(m.optionId) ||
      childrenByParent.get(m.optionName) ||
      childrenByParent.get(m.groupName);

    if (childList && childList.length > 0) {
      const keyUsed = m.optionId || m.optionName;
      if (processedChildKeys.has(keyUsed)) return;
      processedChildKeys.add(keyUsed);

      const childDetails = childList
        .map((c) => {
          let text = c.optionName;
          if (c.quantity && c.quantity > 1) text += ` (x${c.quantity})`;
          if (c.price > 0) text += ` (+$${c.price.toFixed(2)})`;
          return text;
        })
        .join(', ');

      let lineText = `${m.optionName} - ${childDetails}`;
      if (m.price > 0) {
        lineText += ` (+$${m.price.toFixed(2)})`;
      }
      resultLines.push(lineText);
    } else {
      const isAlreadyProcessedChild = Array.from(childrenByParent.values()).some((list) =>
        list.includes(m)
      );

      if (isAlreadyProcessedChild) return;

      let lineText = m.optionName;
      if (m.parentOptionName) {
        lineText = `${m.parentOptionName} - ${m.optionName}`;
      }
      if (m.quantity && m.quantity > 1) lineText += ` (x${m.quantity})`;
      if (m.price > 0) lineText += ` (+$${m.price.toFixed(2)})`;
      resultLines.push(lineText);
    }
  });

  return resultLines;
}

export default function CartItem({ item, onEdit }: CartItemProps) {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = usePosStore();

  const formattedModifiers = useMemo(
    () => getFormattedModifierList(item.selectedModifiers),
    [item.selectedModifiers]
  );

  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-neutral-100 group last:border-0">
      {/* Thumbnail */}
      <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0 mt-0.5">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h5 className="text-[12px] md:text-[13px] font-bold text-neutral-800 leading-tight truncate">{item.name}</h5>

        {/* Selected Modifiers as Vertical List */}
        {formattedModifiers.length > 0 ? (
          <div className="flex flex-col gap-0.5 mt-1">
            {formattedModifiers.map((modText, idx) => (
              <div
                key={idx}
                className="flex items-start gap-1 text-[10px] md:text-[10.5px] font-semibold text-neutral-600 leading-tight"
              >
                <span className="text-neutral-400 font-bold leading-none select-none">•</span>
                <span>{modText}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] md:text-[10.5px] text-neutral-400 italic font-normal mt-0.5 leading-tight">
            No customization
          </p>
        )}

        {item.note && (
          <p className="text-[9px] md:text-[10px] font-semibold text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-1 border border-amber-200 inline-block max-w-full truncate">
            Note: {item.note}
          </p>
        )}
      </div>

      {/* Qty + Price */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className="text-[12px] md:text-[13px] font-bold text-neutral-900">${item.totalPrice.toFixed(2)}</span>
        <div className="flex items-center gap-1">
          {/* Qty control */}
          <div className="flex items-center border border-neutral-200 rounded-md overflow-hidden bg-white">
            <button onClick={() => decreaseQuantity(item.id)} className="w-6 h-6 md:w-6 md:h-6 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 hover:text-brand-primary transition-all cursor-pointer">
              <Minus size={8} strokeWidth={3} />
            </button>
            <span className="w-6 h-6 md:w-6 md:h-6 flex items-center justify-center text-[11px] md:text-[12px] font-bold text-neutral-800 border-x border-neutral-200">
              {item.quantity}
            </span>
            <button onClick={() => increaseQuantity(item.id)} className="w-6 h-6 md:w-6 md:h-6 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 hover:text-green-600 transition-all cursor-pointer">
              <Plus size={8} strokeWidth={3} />
            </button>
          </div>

          {/* Edit Pencil Button */}
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              title="Edit customization"
              className="w-6 h-6 flex items-center justify-center text-sky-600 bg-sky-50 hover:bg-sky-100 hover:text-sky-700 rounded-md transition-all cursor-pointer"
            >
              <Pencil size={11} />
            </button>
          )}

          {/* Delete */}
          <button
            onClick={() => removeFromCart(item.id)}
            title="Remove item"
            className="w-6 h-6 flex items-center justify-center text-red-400 bg-red-50 hover:bg-red-100 hover:text-red-500 rounded-md transition-all cursor-pointer"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}
