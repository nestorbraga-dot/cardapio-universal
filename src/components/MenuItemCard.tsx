/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MenuItem } from '../types';
import { Plus, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface MenuItemCardProps {
  key?: string | number;
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
  onQuickAdd: (item: MenuItem) => void;
}

export default function MenuItemCard({ item, onSelect, onQuickAdd }: MenuItemCardProps) {
  return (
    <motion.div
      layout
      onClick={() => item.available && onSelect(item)}
      className={`group flex flex-col bg-white border rounded-2xl overflow-hidden transition-all duration-200 text-left ${
        item.available
          ? 'border-stone-200 hover:border-[#f48000]/60 hover:shadow-md cursor-pointer'
          : 'border-stone-100 bg-stone-50/50 opacity-60 cursor-not-allowed'
      }`}
      id={`menu-item-card-${item.id}`}
    >
      {/* Visual Thumbnail */}
      <div className="relative h-44 overflow-hidden bg-stone-100 border-b border-stone-200">
        <img
          src={item.imageUrl}
          alt={item.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-300 ease-out"
        />

        {/* Categories tags over visuals */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {item.tags.slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-[#f48000]/95 text-white rounded-full shadow-xs"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* If item not available, show overlay banner */}
        {!item.available && (
          <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-3xs flex items-center justify-center text-white font-mono text-xs uppercase tracking-wider">
            <span>Esgotado</span>
          </div>
        )}
      </div>

      {/* Item summary details */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          <h3 className="font-sans text-sm font-bold text-stone-900 group-hover:text-orange-600 transition-colors leading-snug mb-1">
            {item.name}
          </h3>

          <p className="text-stone-500 text-xs line-clamp-2 leading-relaxed mb-4 font-light">
            {item.description}
          </p>
        </div>

        <div>
          {/* Small Stats indicator */}
          <div className="flex gap-3 text-[9px] font-mono tracking-wider text-stone-400 border-t border-stone-100 pt-3 mb-3.5">
            {item.prepTime && (
              <span>
                {item.prepTime.toUpperCase()}
              </span>
            )}
            {item.calories && (
              <span>
                {item.calories} KCAL
              </span>
            )}
          </div>

          {/* Pricing Action Bottom line */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-sm font-bold text-stone-900">
                R$ {item.price.toFixed(2)}
              </span>
            </div>

            {item.available && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickAdd(item);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#f48000] border border-[#f48000] text-white text-[10px] tracking-wider uppercase font-bold rounded-full hover:bg-orange-600 hover:border-orange-600 transition-colors duration-150 cursor-pointer shadow-xs"
                id={`add-btn-${item.id}`}
              >
                <Plus size={11} strokeWidth={3} />
                <span>Adicionar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
