/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MenuItem, OptionChoice } from '../types';
import { X, Plus, Minus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ItemCustomizeModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItem, quantity: number, selectedChoices: { [key: string]: OptionChoice[] }, notes: string) => void;
}

export default function ItemCustomizeModal({ item, isOpen, onClose, onAddToCart }: ItemCustomizeModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedChoices, setSelectedChoices] = useState<{ [key: string]: OptionChoice[] }>({});
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (item && isOpen) {
      setQuantity(1);
      setNotes('');
      // Populate defaults
      const defaults: { [key: string]: OptionChoice[] } = {};
      if (item.options) {
        item.options.forEach(opt => {
          if (opt.required && opt.choices.length > 0) {
            const matchingChoice = opt.choices.find(c => c.name.includes('(Recomendado)')) || opt.choices[0];
            defaults[opt.name] = [matchingChoice];
          } else {
            defaults[opt.name] = [];
          }
        });
      }
      setSelectedChoices(defaults);
    }
  }, [item, isOpen]);

  if (!item) return null;

  const handleChoiceSelect = (optionName: string, choice: OptionChoice, type: 'single' | 'multiple') => {
    setSelectedChoices(prev => {
      const current = prev[optionName] || [];
      if (type === 'single') {
        return { ...prev, [optionName]: [choice] };
      } else {
        const index = current.findIndex(c => c.name === choice.name);
        if (index > -1) {
          return {
            ...prev,
            [optionName]: current.filter(c => c.name !== choice.name)
          };
        } else {
          return {
            ...prev,
            [optionName]: [...current, choice]
          };
        }
      }
    });
  };

  const getUnitPriceWithChoices = () => {
    let price = item.price;
    (Object.values(selectedChoices) as OptionChoice[][]).forEach(choicesList => {
      choicesList.forEach(choice => {
        price += choice.priceModifier;
      });
    });
    return price;
  };

  const unitPrice = getUnitPriceWithChoices();
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    if (item.options) {
      for (const opt of item.options) {
        if (opt.required && (!selectedChoices[opt.name] || selectedChoices[opt.name].length === 0)) {
          alert(`Por favor, selecione uma opção para "${opt.name}"`);
          return;
        }
      }
    }
    onAddToCart(item, quantity, selectedChoices, notes);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-3xs"
            id="modal-backdrop"
          />          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative w-full max-w-xl bg-white border border-stone-200 overflow-hidden flex flex-col max-h-[85vh] rounded-3xl shadow-2xl"
            id="customize-modal"
          >
            {/* Header Title Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-[#FAF9F6]">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-orange-500 font-bold">
                  {item.category.toUpperCase()}
                </span>
                <h3 className="font-sans text-base font-bold text-stone-900 leading-snug">
                  {item.name}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-stone-400 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
                id="close-modal-btn"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6" id="modal-body">
              {/* Description */}
              <p className="text-stone-500 text-xs font-light leading-relaxed">
                {item.description}
              </p>

              {/* Ingredients list */}
              <div className="space-y-2">
                <span className="block text-[9px] font-mono uppercase tracking-widest text-stone-400 font-semibold">Ingredientes principais</span>
                <div className="flex flex-wrap gap-1.5">
                  {item.ingredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-stone-50 border border-stone-100 rounded-full text-stone-600 text-[10px] font-medium uppercase"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dynamic Menu Options */}
              {item.options && item.options.length > 0 && (
                <div className="space-y-6">
                  {item.options.map((opt, oIdx) => {
                    const isSelectedList = selectedChoices[opt.name] || [];
                    return (
                      <div key={oIdx} className="border-t border-stone-100 pt-5">
                        <div className="flex items-baseline justify-between mb-3">
                          <label className="text-xs uppercase font-sans tracking-wider text-stone-900 font-bold">
                            {opt.name} {opt.required && <span className="text-[#f48000] text-[9px] font-bold leading-none ml-1">(OBRIGATÓRIO)</span>}
                          </label>
                          <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest">
                            {opt.type === 'single' ? 'Escolha 1' : 'Múltiplas'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          {opt.choices.map((choice, cIdx) => {
                            const isChecked = isSelectedList.some(c => c.name === choice.name);
                            return (
                              <button
                                key={cIdx}
                                type="button"
                                onClick={() => handleChoiceSelect(opt.name, choice, opt.type)}
                                className={`flex items-center justify-between p-3 border rounded-xl text-left transition-all ${
                                  isChecked
                                    ? 'border-[#f48000] bg-orange-50/40 text-stone-950 font-bold'
                                    : 'border-stone-200 bg-transparent text-stone-650 hover:border-stone-400'
                                }`}
                              >
                                <span className="text-xs flex items-center gap-2.5">
                                  <span
                                    className={`w-4 h-4 flex items-center justify-center border transition-all rounded-sm ${
                                      isChecked
                                        ? 'border-[#f48000] bg-[#f48000] text-white'
                                        : 'border-stone-300 bg-white'
                                    }`}
                                  >
                                    {isChecked && <Check size={10} strokeWidth={3} />}
                                  </span>
                                  {choice.name}
                                </span>
                                {choice.priceModifier > 0 && (
                                  <span className="text-[10px] font-mono text-orange-600 font-semibold">
                                    + R$ {choice.priceModifier.toFixed(2)}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Special Notes / Observations */}
              <div className="border-t border-stone-100 pt-5 space-y-2">
                <span className="block text-[9px] font-mono uppercase tracking-widest text-stone-400 font-semibold">Observações ou instruções de preparo</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: sem calda, copo com gelo..."
                  maxLength={140}
                  className="w-full h-16 p-3 bg-stone-50 border border-stone-200 rounded-2xl focus:border-[#f48000] focus:ring-1 focus:ring-[#f48000] focus:outline-none text-stone-800 text-xs placeholder:text-stone-350 resize-none font-light shadow-xs"
                  id="choice-notes"
                />
              </div>
            </div>

            {/* Footer Control Panel */}
            <div className="border-t border-stone-100 p-4 flex items-center justify-between gap-4 bg-[#FAF9F6]">
              {/* Stepper counter */}
              <div className="flex items-center gap-4 border border-stone-200 px-3 py-1 bg-white rounded-full shadow-xs">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(q => q - 1)}
                  className="p-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-30 cursor-pointer rounded-full"
                  id="qty-decrement-btn"
                >
                  <Minus size={13} />
                </button>
                <span className="font-mono text-sm font-bold text-stone-900 select-none w-4 text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="p-1.5 text-stone-500 hover:text-stone-900 cursor-pointer rounded-full"
                  id="qty-increment-btn"
                >
                  <Plus size={13} />
                </button>
              </div>

              {/* Total and add */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block font-mono">TOTAL ESTIMADO</span>
                  <span className="font-mono text-base font-bold text-stone-950">
                    R$ {totalPrice.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={!item.available}
                  className="px-6 py-2.5 bg-[#f48000] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-orange-600 transition-colors duration-150 cursor-pointer disabled:bg-stone-200 disabled:cursor-not-allowed shadow-sm"
                  id="add-to-cart-action-btn"
                >
                  Adicionar à Sacola
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
