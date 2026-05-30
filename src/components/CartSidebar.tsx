import React, { useState } from 'react';
import { CartItem } from '../types';
import { X, Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartSidebarProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveItem: (cartId: string) => void;
  onUpdateQuantity: (cartId: string, quantity: number) => void;
  onSubmitOrder: (customerName: string, paymentMethod: string) => void;
  selectedTable: string;
}

export default function CartSidebar({
  items,
  isOpen,
  onClose,
  onRemoveItem,
  onUpdateQuantity,
  onSubmitOrder,
  selectedTable
}: CartSidebarProps) {
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Por favor, informe o seu nome para identificação do pedido.');
      return;
    }
    if (items.length === 0) {
      alert('Seu carrinho está vazio.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitOrder(customerName, paymentMethod);
      setIsSubmitting(false);
      setCustomerName('');
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" id="cart-drawer-container">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/50 backdrop-blur-3xs"
            id="cart-backdrop"
          />

          {/* Drawer body */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 225 }}
            className="relative w-full max-w-sm bg-[#FAF9F6] border-l border-stone-300 h-full flex flex-col z-10"
            id="cart-drawer"
          >
            {/* Header */}
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-[#FAF9F6]">
              <div>
                <span className="text-[9px] font-mono uppercase tracking-widest text-orange-500 font-bold">Mesa/Balcão • {selectedTable}</span>
                <h3 className="font-sans text-base font-bold text-stone-950">
                  Sua Sacola
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 px-3 border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer text-[10px] uppercase font-bold rounded-full"
                id="close-cart-btn"
              >
                Fechar
              </button>
            </div>

            {/* Cart content list */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white" id="cart-items-wrapper">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#f48000] font-bold">SACOLA VAZIA</span>
                  <p className="text-stone-500 text-xs font-light max-w-[200px] mx-auto">
                    Adicione seus sorvetes ou pratos favoritos para começar!
                  </p>
                </div>
              ) : (
                items.map((cartItem) => (
                  <div
                    key={cartItem.cartId}
                    className="flex gap-3 p-3 bg-stone-50/50 border border-stone-100 rounded-2xl shadow-xs"
                    id={`cart-item-${cartItem.cartId}`}
                  >
                    {/* Item Thumbnail */}
                    <img
                      src={cartItem.menuItem.imageUrl}
                      alt={cartItem.menuItem.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 object-cover bg-stone-100 transition-all border border-stone-100 rounded-xl"
                    />

                    {/* Meta info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-sans text-xs font-bold text-stone-900 truncate">
                            {cartItem.menuItem.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(cartItem.cartId)}
                            className="text-stone-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer rounded-full"
                            id={`remove-item-${cartItem.cartId}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Selected options summaries */}
                        {Object.entries(cartItem.selectedChoices).some(([_, arr]) => arr.length > 0) && (
                          <div className="space-y-0.5 mt-1">
                            {Object.entries(cartItem.selectedChoices).map(([optName, selectedArray]) => {
                              if (selectedArray.length === 0) return null;
                              return (
                                <p key={optName} className="text-[9px] text-[#f48000] font-bold uppercase tracking-tight">
                                  {optName}: {selectedArray.map(c => c.name).join(', ')}
                                </p>
                              );
                            })}
                          </div>
                        )}

                        {/* Customer observation notes */}
                        {cartItem.notes && (
                          <p className="text-[9px] italic text-stone-500 mt-1">
                            Obs: "{cartItem.notes}"
                          </p>
                        )}
                      </div>

                      {/* Stepper counters and dynamic subtotal */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-100/50">
                        <div className="flex items-center gap-2 bg-white border border-stone-200 px-2 py-0.5 rounded-full shadow-2xs">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(cartItem.cartId, cartItem.quantity - 1)}
                            className="p-0.5 text-stone-400 hover:text-stone-900 cursor-pointer rounded-full"
                            id={`cart-qty-dec-${cartItem.cartId}`}
                          >
                            <Minus size={10} />
                          </button>
                          <span className="font-mono text-[10px] font-bold text-stone-800 min-w-[12px] text-center select-none">
                            {cartItem.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(cartItem.cartId, cartItem.quantity + 1)}
                            className="p-0.5 text-stone-400 hover:text-stone-950 cursor-pointer rounded-full"
                            id={`cart-qty-inc-${cartItem.cartId}`}
                          >
                            <Plus size={10} />
                          </button>
                        </div>

                        <span className="font-mono text-xs font-bold text-[#f48000]">
                          R$ {cartItem.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Simulating checkout card */}
            {items.length > 0 && (
              <div className="border-t border-stone-200 bg-[#FAF9F6] p-6 space-y-4" id="cart-checkout-block">
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Customer name */}
                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-widest text-[#f48000] mb-1.5 font-bold">
                      Seu Nome para Identificar o Pedido
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Identificação do pedido..."
                      className="w-full px-4 py-2 bg-white border border-stone-200 focus:border-[#f48000] focus:ring-1 focus:ring-[#f48000] rounded-xl focus:outline-none text-xs text-stone-800 shadow-xs"
                      id="customer-name-field"
                    />
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-[9px] font-mono uppercase tracking-widest text-stone-400 mb-1.5 font-bold">
                      Forma de Pagamento
                    </label>
                    <div className="grid grid-cols-2 gap-2" id="payment-methods">
                      {['PIX', 'Cartão', 'Dinheiro', 'Vale'].map((method) => {
                        const isSelected = paymentMethod === method;
                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={`flex items-center gap-1.5 px-2 py-2 text-[10px] font-bold border uppercase transition-all rounded-xl justify-center cursor-pointer shadow-2xs ${
                              isSelected
                                ? 'border-[#f48000] bg-[#f48000] text-white font-black'
                                : 'border-stone-200 bg-white text-stone-500 hover:border-[#f48000]'
                            }`}
                          >
                            <CreditCard size={11} />
                            <span>{method}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pricing breakdown */}
                  <div className="space-y-1.5 pt-3 border-t border-stone-200/60 font-medium">
                    <div className="flex justify-between text-[11px] font-light text-stone-400">
                      <span>Subtotal dos itens:</span>
                      <span className="font-mono">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-[#f48000] pt-1.5 border-t border-stone-200/30">
                      <span>TOTAL DA SACOLA</span>
                      <span className="font-mono text-sm">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Submit Order action buttons */}
                  <button
                    type="submit"
                    disabled={isSubmitting || items.length === 0}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#f48000] hover:bg-orange-600 border border-[#f48000] text-white font-bold uppercase rounded-full text-xs tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm animate-none"
                    id="submit-order-button"
                  >
                    <span>{isSubmitting ? 'ENVIANDO...' : 'ENVIAR COZINHA'}</span>
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
