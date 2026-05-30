/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Search, ShoppingBag, IceCream } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTable: string;
  setSelectedTable: (table: string) => void;
  cartCount: number;
  openCart: () => void;
  onBackToPortal: () => void;
}

export default function Header({
  searchQuery,
  setSearchQuery,
  selectedTable,
  setSelectedTable,
  cartCount,
  openCart,
  onBackToPortal
}: HeaderProps) {
  const [secretClicks, setSecretClicks] = useState(0);
  const tables = ['Balcão 1'];

  useEffect(() => {
    if (secretClicks === 0) return;
    const timer = window.setTimeout(() => setSecretClicks(0), 3000);
    return () => window.clearTimeout(timer);
  }, [secretClicks]);

  const handleLogoClick = () => {
    setSecretClicks((current) => {
      const next = current + 1;
      if (next >= 5) {
        onBackToPortal();
        return 0;
      }
      return next;
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-stone-200" id="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Branding - Orange Ice Cream icon and text */}
          <div className="flex items-center justify-between">
            <div 
              onClick={handleLogoClick} 
              className="cursor-pointer flex items-center gap-2 group select-none"
              title="Clique cinco vezes para o portal secreto"
            >
              <IceCream size={26} className="text-[#f48000] fill-transparent stroke-2 group-hover:scale-110 transition-transform duration-150" />
              <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-[#f48000] select-none">
                Doce Sabor
              </h1>
            </div>

            {/* Quick Mobile Cart */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={openCart}
                className="relative p-2.5 rounded-full border border-stone-300 text-stone-700 hover:bg-stone-900 hover:text-white transition-colors duration-150 cursor-pointer"
                id="mobile-cart-btn"
              >
                <ShoppingBag size={16} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#f48000] px-1 text-[9px] font-mono font-bold text-white leading-none">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search, Table, Selector, Modes */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            
            {/* Search Input - fully rounded to match screenshot */}
            <div className="relative flex-1 min-w-[200px] sm:flex-initial">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar sorvetes, lanches, sobremesas..."
                className="w-full sm:w-[280px] pl-10 pr-4 py-2 bg-white rounded-full text-xs text-stone-800 placeholder:text-stone-400 border border-stone-200 focus:border-[#f48000] focus:ring-1 focus:ring-[#f48000] focus:outline-none transition-all shadow-xs"
                id="search-menu-input"
              />
            </div>

            {/* Table Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 rounded-full bg-white text-stone-700 shadow-xs">
              <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400">Mesa:</span>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer pr-1"
                id="table-selection"
              >
                {tables.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop Cart Button */}
            <button
              type="button"
              onClick={openCart}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-[#f48000] bg-[#f48000] hover:bg-orange-600 text-white text-xs font-medium tracking-wide transition-colors duration-150 cursor-pointer shadow-xs"
              id="desktop-cart-btn"
            >
              <ShoppingBag size={14} />
              <span>Sacola</span>
              <span className="h-4.5 min-w-[18px] bg-white text-[#f48000] font-mono flex items-center justify-center rounded-full leading-none text-[10px] font-bold">
                {cartCount}
              </span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
