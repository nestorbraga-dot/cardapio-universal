import React, { useState, useEffect } from 'react';
import { Order, MenuItem, OptionChoice } from '../types';
import { 
  ChefHat, 
  Clock, 
  Check, 
  Volume2, 
  VolumeX, 
  Store, 
  Settings, 
  Package, 
  CheckCircle2, 
  RotateCcw,
  CheckCircle,
  Play,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KitchenKDSProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onNavigateTo: (mode: 'menu' | 'admin' | 'portal') => void;
}

export default function KitchenKDS({
  orders,
  onUpdateOrderStatus,
  onNavigateTo
}: KitchenKDSProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [completedKitchenSteps, setCompletedKitchenSteps] = useState<{ [stepKey: string]: boolean }>({});
  const [prevOrdersCount, setPrevOrdersCount] = useState(orders.length);

  // Helper sound synthesiser
  const playChime = () => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      // First note (C5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime);
      gain1.gain.setValueAtTime(0.12, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.35);
      
      // Second note (E5) after an elegant tiny delay
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
      gain2.gain.setValueAtTime(0, ctx.currentTime);
      gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.warn("Chime webaudio could not start:", e);
    }
  };

  // Play a beautiful synthesized alert when a new order comes in
  useEffect(() => {
    if (orders.length > prevOrdersCount) {
      const newestOrder = orders[0];
      if (newestOrder && newestOrder.status === 'pending') {
        playChime();
      }
    }
    setPrevOrdersCount(orders.length);
  }, [orders, prevOrdersCount]);

  const toggleStep = (stepKey: string) => {
    setCompletedKitchenSteps(prev => ({
      ...prev,
      [stepKey]: !prev[stepKey]
    }));
  };

  const getPrepSteps = (item: any) => {
    const steps: string[] = [];
    
    // Step 1: Base prep
    steps.push(`Preparar taça/louça e porcionar ${item.menuItem.name}`);
    
    // Step 2: Recipe ingredients
    if (item.menuItem.ingredients && item.menuItem.ingredients.length > 0) {
      item.menuItem.ingredients.forEach((ing: string) => {
        steps.push(`Ingrediente receita: ${ing}`);
      });
    } else {
      steps.push("Adicionar ingredientes base da receita do Chef");
    }
    
    // Step 3: Selected custom choices
    const choiceNames: string[] = [];
    Object.entries(item.selectedChoices || {}).forEach(([optName, choicesArray]: [string, any]) => {
      if (Array.isArray(choicesArray)) {
        choicesArray.forEach((choice: any) => {
          choiceNames.push(`${optName}: ${choice.name}`);
        });
      }
    });
    
    if (choiceNames.length > 0) {
      choiceNames.forEach(text => {
        steps.push(`Incluir opcional: ${text}`);
      });
    }
    
    // Step 4: Special remarks or notes
    if (item.notes && item.notes.trim()) {
      steps.push(`ATENÇÃO À OBS: "${item.notes}"`);
    }
    
    // Step 5: Plating and decor
    steps.push("Finalizar montagem, toppings e Controle de Qualidade");
    
    return steps;
  };

  // Organize orders into columns
  const preparingOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const deliveredOrders = orders.filter(o => o.status === 'delivered').slice(0, 8); // Keep last 8 delivered

  return (
    <div className="min-h-screen bg-[#F0EFEA] flex flex-col font-sans text-stone-900 overflow-x-hidden select-none" id="kitchen-application-layer">
      {/* Black Navbar matches Screenshot 1 */}
      <header className="bg-[#121212] px-6 py-4 flex items-center justify-between text-white border-b border-stone-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#f48000] flex items-center justify-center text-white">
            <ChefHat size={20} strokeWidth={2.5} />
          </div>
          <span className="font-sans font-black text-lg tracking-wider uppercase">PAINEL DA COZINHA</span>
        </div>

        {/* Action Header Nav */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigateTo('menu')}
            className="text-stone-300 hover:text-white font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            Ver Loja
          </button>
          
          <span className="text-stone-700">|</span>
          
          <button
            type="button"
            onClick={() => onNavigateTo('admin')}
            className="text-stone-300 hover:text-[#f48000] font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            Gerenciar Cardápio
          </button>

          <span className="text-stone-700">|</span>

          {/* Chime Mudo toggle */}
          <button
            type="button"
            onClick={() => {
              setIsMuted(!isMuted);
              if (isMuted) {
                // Sound test
                setTimeout(() => playChime(), 100);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isMuted 
                ? 'bg-rose-950/40 border-rose-900/40 text-rose-400' 
                : 'bg-stone-900 border-stone-750 text-amber-500 hover:bg-stone-850'
            }`}
            id="kitchen-chime-toggle"
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            <span>{isMuted ? 'Mudo' : 'Chime Ativo'}</span>
          </button>

          {/* Fila Ativa Pulsing Red Alert Button */}
          <div className="hidden sm:flex items-center gap-2 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#FAF9F6]">Fila Ativa</span>
          </div>
        </div>
      </header>

      {/* Main KDS Board Grid (Three Columns) */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 h-[calc(100vh-73px)] overflow-hidden">
        
        {/* COLUMN 1: Preparando */}
        <section className="bg-[#FAF9F6] border border-stone-250 rounded-[2rem] flex flex-col overflow-hidden shadow-sm" id="column-preparando">
          {/* Column Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-100/50">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[#f48000]" />
              <h3 className="font-sans font-black text-stone-900 uppercase text-sm tracking-wide">Preparando</h3>
            </div>
            <span className="bg-stone-200 text-stone-800 font-mono text-xs font-extrabold px-2.5 py-1 rounded-full">
              {preparingOrders.length}
            </span>
          </div>

          {/* Column Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-210px)]">
            {preparingOrders.length === 0 ? (
              <div className="py-24 text-center text-stone-400 flex flex-col items-center justify-center space-y-3">
                <div className="p-4 bg-stone-100 rounded-full text-stone-300">
                  <Clock size={32} />
                </div>
                <p className="font-mono text-xs uppercase tracking-wider font-bold">Nenhum pedido na fila de produção.</p>
              </div>
            ) : (
              <AnimatePresence>
                {preparingOrders.map((order) => {
                  let totalSteps = 0;
                  let completedSteps = 0;

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white border border-stone-250 rounded-2xl p-5 shadow-3xs hover:border-stone-450 transition-all text-left space-y-4"
                      id={`kds-prep-card-${order.id}`}
                    >
                      {/* Ticket Header */}
                      <div className="flex justify-between items-start border-b border-stone-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-stone-900 text-[#f48000] font-mono text-xs font-black px-2.5 py-0.5 rounded-lg">
                              {order.tableNumber}
                            </span>
                            <span className="text-[10px] font-mono text-stone-400">
                              #{order.id.slice(-6).toUpperCase()}
                            </span>
                          </div>
                          <h4 className="font-sans text-sm font-black text-stone-900 mt-1 uppercase">
                            {order.customerName}
                          </h4>
                        </div>
                        <span className="font-mono text-[10px] text-stone-400 font-bold bg-stone-50 border border-stone-150 px-2 py-0.5 rounded">
                          {order.createdAt}
                        </span>
                      </div>

                      {/* Items loop with simple static bulleted instructions */}
                      <div className="space-y-4">
                        {order.items.map((item, itemIdx) => {
                          const steps = getPrepSteps(item);

                          return (
                            <div key={item.cartId || itemIdx} className="space-y-2">
                              <div className="flex justify-between items-center bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
                                <span className="font-sans text-xs font-black text-stone-900">
                                  {item.quantity}x {item.menuItem.name}
                                </span>
                                <span className="text-[8px] font-mono uppercase font-black text-stone-450">
                                  Item {itemIdx + 1}/{order.items.length}
                                </span>
                              </div>

                              {/* Static bulleted instructions list */}
                              <ul className="space-y-1 pl-2 text-stone-700 list-disc list-inside text-[11px] leading-relaxed">
                                {steps.map((step, stepIdx) => (
                                  <li key={stepIdx} className="font-light">
                                    <span className="text-stone-600">{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>

                      {/* Ticket Footer Action without checklist blocking/warning alerts */}
                      <div className="pt-3 border-t border-stone-150">
                        <div className="flex justify-between items-center">
                          {order.status === 'pending' ? (
                            <button
                              type="button"
                              onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                              className="w-full py-2 bg-stone-900 text-white hover:bg-[#f48000] font-mono text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-3xs cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Play size={10} fill="white" />
                              <span>Iniciar Preparo</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateOrderStatus(order.id, 'ready');
                              }}
                              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-650 font-mono text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-3xs cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle size={10} />
                              <span>Finalizar Prato</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </section>

        {/* COLUMN 2: Pronto (Aguardando) */}
        <section className="bg-[#FAF9F6] border border-stone-250 rounded-[2rem] flex flex-col overflow-hidden shadow-sm" id="column-prontos">
          {/* Column Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-100/50">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-emerald-600" />
              <h3 className="font-sans font-black text-stone-900 uppercase text-sm tracking-wide">Pronto (Aguardando)</h3>
            </div>
            <span className="bg-emerald-100 text-emerald-800 font-mono text-xs font-extrabold px-2.5 py-1 rounded-full">
              {readyOrders.length}
            </span>
          </div>

          {/* Column Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-210px)]">
            {readyOrders.length === 0 ? (
              <div className="py-24 text-center text-stone-400 flex flex-col items-center justify-center space-y-3">
                <div className="p-4 bg-stone-100 rounded-full text-stone-300">
                  <Package size={32} />
                </div>
                <p className="font-mono text-xs uppercase tracking-wider font-bold">Aguardando novos preparos ficarem prontos.</p>
              </div>
            ) : (
              <AnimatePresence>
                {readyOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white border-2 border-emerald-500 rounded-2xl p-5 shadow-2xs text-left space-y-4 relative overflow-hidden"
                    id={`kds-ready-card-${order.id}`}
                  >
                    {/* Glowing highlight indicator */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />

                    {/* Ticket Header */}
                    <div className="flex justify-between items-start border-b border-stone-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-emerald-600 text-white font-mono text-xs font-black px-2.5 py-0.5 rounded-lg">
                            {order.tableNumber}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400 font-bold">
                            #{order.id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-sans text-sm font-black text-stone-900 mt-1 uppercase">
                          {order.customerName}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-extrabold border border-emerald-150 animate-pulse">
                        LEVAR PRATO
                      </span>
                    </div>

                    {/* Summary list */}
                    <div className="text-xs text-stone-700 space-y-2 font-medium bg-stone-50 p-3 rounded-xl border border-stone-150">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-stone-400 font-bold block">Pratos Prontos:</span>
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>
                            <strong className="font-black text-stone-900">{it.quantity}x</strong> {it.menuItem.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Mark Served trigger */}
                    <button
                      type="button"
                      onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                      className="w-full py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 font-mono text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-3xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={11} strokeWidth={2.5} />
                      <span>Marcar como Servido</span>
                    </button>
                    
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </section>

        {/* COLUMN 3: Entregues (Histórico recente) */}
        <section className="bg-[#FAF9F6] border border-stone-250 rounded-[2rem] flex flex-col overflow-hidden shadow-sm animate-fadeIn" id="column-entregues">
          {/* Column Header */}
          <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-100/50">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-stone-500" />
              <h3 className="font-sans font-black text-stone-500 uppercase text-sm tracking-wide">Entregues</h3>
            </div>
            <span className="bg-stone-300 text-stone-700 font-mono text-xs font-extrabold px-2.5 py-1 rounded-full">
              {deliveredOrders.length}
            </span>
          </div>

          {/* Column Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[calc(100vh-210px)] bg-stone-50/40">
            {deliveredOrders.length === 0 ? (
              <div className="py-24 text-center text-stone-400 flex flex-col items-center justify-center space-y-3">
                <p className="font-mono text-xs uppercase tracking-wider font-bold">Histórico vazio.</p>
              </div>
            ) : (
              <AnimatePresence>
                {deliveredOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    className="bg-white border border-stone-200 rounded-2xl p-4.5 shadow-3xs opacity-85 text-left space-y-3 relative overflow-hidden"
                    id={`kds-delivered-card-${order.id}`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex gap-2 items-center">
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-600 font-mono text-[10px] font-black rounded">
                          {order.tableNumber}
                        </span>
                        <span className="font-sans font-bold text-stone-850 truncate max-w-[110px]">
                          {order.customerName}
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => onUpdateOrderStatus(order.id, 'preparing')}
                        className="p-1.5 font-mono text-[9px] text-[#f48000] hover:bg-orange-50 font-black rounded-lg transition-colors border border-stone-200 flex items-center gap-0.5"
                        title="Desfazer entrega"
                      >
                        <RotateCcw size={10} />
                        <span>Desfazer</span>
                      </button>
                    </div>

                    <div className="text-[11px] text-stone-500 space-y-1 font-light">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{it.quantity}x {it.menuItem.name}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
