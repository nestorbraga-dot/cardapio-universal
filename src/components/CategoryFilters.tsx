/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Category } from '../types';

interface CategoryFiltersProps {
  categories: Category[];
  activeCategory: string;
  setActiveCategory: (catId: string) => void;
}

export default function CategoryFilters({ categories, activeCategory, setActiveCategory }: CategoryFiltersProps) {
  return (
    <div className="w-full py-1" id="category-navigation">
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        
        {/* 'Todos' Pill Option */}
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer select-none border whitespace-nowrap ${
            activeCategory === 'all'
              ? 'bg-[#f48000] border-[#f48000] text-white shadow-sm font-bold'
              : 'bg-white border-stone-200 text-stone-650 hover:border-stone-400 hover:bg-stone-50'
          }`}
          id="category-tab-all"
        >
          Todos
        </button>

        {/* Dynamic categories map */}
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer select-none border whitespace-nowrap ${
                isActive
                  ? 'bg-[#f48000] border-[#f48000] text-white shadow-sm font-bold'
                  : 'bg-white border-stone-200 text-stone-650 hover:border-stone-400 hover:bg-stone-50'
              }`}
              id={`category-tab-${category.id}`}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
