/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, addDoc, getDocs
} from 'firebase/firestore';
import { db } from './lib/firebase';
import { MenuItem, CartItem, Order, OptionChoice, Category } from './types';
import { CATEGORIES, INITIAL_MENU_ITEMS, MOCK_REVIEWS } from './data';
import Header from './components/Header';
import CategoryFilters from './components/CategoryFilters';
import MenuItemCard from './components/MenuItemCard';
import ItemCustomizeModal from './components/ItemCustomizeModal';
import CartSidebar from './components/CartSidebar';
import AdminPanel from './components/AdminPanel';
import KitchenKDS from './components/KitchenKDS';
import AboutSection from './components/AboutSection';
import {
  Sparkles, ShoppingBag, Clock, Heart, ChefHat, CheckCircle2, Coffee, Lock,
  ArrowRight, ShieldCheck, User, IceCream, Home, ClipboardList, Trash2,
  CreditCard, Minus, Plus, AlertCircle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const seeded = useRef(false);

  // --- Firestore State ---
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // --- UI/UX States (localStorage) ---
  const [appMode, setAppMode] = useState<'portal' | 'menu' | 'admin' | 'kitchen'>(() => {
    const saved = localStorage.getItem('cardapio_app_mode');
    return (saved as any) || 'portal';
  });
  const [adminPinInput, setAdminPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [kitchenPinInput, setKitchenPinInput] = useState('');
  const [kitchenPinError, setKitchenPinError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState('Mesa 1');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'cart' | 'orders' | 'about'>('menu');
  const [cartCustomerName, setCartCustomerName] = useState('');
  const [cartPaymentMethod, setCartPaymentMethod] = useState('PIX');
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });

  // Auto-hide toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ message: '', show: false }), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  // --- Firestore Data Fetching ---
  useEffect(() => {
    const fetchMenuItems = async () => {
      const snapshot = await getDocs(collection(db, 'menuItems'));
      if (snapshot.empty && !seeded.current) {
        seeded.current = true;
        await Promise.all([
          ...INITIAL_MENU_ITEMS.map((item) => setDoc(doc(db, 'menuItems', item.id), item)),
          ...CATEGORIES.map((cat) => setDoc(doc(db, 'categories', cat.id), cat)),
        ]);
        const refetch = await getDocs(collection(db, 'menuItems'));
        setMenuItems(refetch.docs.map((d) => ({ ...d.data(), id: d.id } as MenuItem)));
      } else {
        setMenuItems(snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as MenuItem)));
      }
      setLoading(false);
    };
    fetchMenuItems();

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      if (!snapshot.empty) {
        setCategories(snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Category)));
      }
    });

    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      if (!snapshot.empty) {
        setOrders(snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as unknown as Order)));
      }
    });

    return () => {
      unsubCategories();
      unsubOrders();
    };
  }, []);

  // --- Sync appMode to localStorage ---
  useEffect(() => {
    localStorage.setItem('cardapio_app_mode', appMode);
  }, [appMode]);

  // --- Menu filters ---
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // --- Cart (client-side only) ---
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cardapio_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cardapio_cart', JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (
    item: MenuItem,
    quantity: number,
    selectedChoices: { [key: string]: OptionChoice[] },
    notes: string
  ) => {
    const comboKey = JSON.stringify({
      itemId: item.id,
      choices: Object.entries(selectedChoices).reduce((acc, [k, v]) => {
        acc[k] = v.map((choice) => choice.name).sort();
        return acc;
      }, {} as { [key: string]: string[] }),
      notes
    });

    let unitPrice = item.price;
    Object.values(selectedChoices).forEach((choicesList) => {
      choicesList.forEach((choice) => { unitPrice += choice.priceModifier; });
    });

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((i) => i.cartId === comboKey);
      if (existingIdx > -1) {
        const copy = [...prevCart];
        const updatedQty = copy[existingIdx].quantity + quantity;
        copy[existingIdx] = { ...copy[existingIdx], quantity: updatedQty, totalPrice: updatedQty * unitPrice };
        return copy;
      } else {
        const newCartItem: CartItem = {
          cartId: comboKey,
          menuItem: item,
          quantity,
          selectedChoices,
          notes,
          unitPriceWithChoices: unitPrice,
          totalPrice: quantity * unitPrice
        };
        return [...prevCart, newCartItem];
      }
    });

    setToast({ message: `"${item.name}" adicionado à sacola!`, show: true });
  };

  const handleQuickAdd = (item: MenuItem) => {
    if (item.options && item.options.length > 0) {
      setSelectedItem(item);
    } else {
      handleAddToCart(item, 1, {}, '');
    }
  };

  const handleRemoveCartItem = (cartId: string) => {
    setCart((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const handleUpdateCartQuantity = (cartId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.cartId === cartId) {
            const nextQty = Math.max(0, item.quantity + delta);
            if (nextQty === 0) return null;
            return { ...item, quantity: nextQty, totalPrice: nextQty * item.unitPriceWithChoices };
          }
          return item;
        })
        .filter((i): i is CartItem => i !== null);
    });
  };

  // --- Firebase: Submit Order ---
  const handleSubmitOrder = async (customerName: string, paymentMethod: string) => {
    if (cart.length === 0) return;

    const totalPrice = cart.reduce((sum, i) => sum + i.totalPrice, 0);

    const orderRef = await addDoc(collection(db, 'orders'), {
      items: cart.map((i) => ({
        cartId: i.cartId,
        menuItemId: i.menuItem.id,
        menuItemName: i.menuItem.name,
        menuItemPrice: i.menuItem.price,
        imageUrl: i.menuItem.imageUrl,
        quantity: i.quantity,
        selectedChoices: i.selectedChoices,
        notes: i.notes,
        unitPriceWithChoices: i.unitPriceWithChoices,
        totalPrice: i.totalPrice,
      })),
      totalPrice,
      status: 'pending',
      customerName: customerName.trim(),
      tableNumber: selectedTable,
      paymentMethod,
      createdAt: new Date().toISOString(),
    });

    setCart([]);
    setIsCartOpen(false);
    setActiveTab('orders');

    setSuccessOrder({
      id: orderRef.id,
      items: [...cart],
      totalPrice,
      status: 'pending',
      customerName: customerName.trim(),
      tableNumber: selectedTable,
      paymentMethod,
      createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });
  };

  // --- Firebase: Admin Actions ---
  const handleToggleAvailability = async (itemId: string) => {
    const item = menuItems.find((i) => i.id === itemId);
    if (item) {
      await updateDoc(doc(db, 'menuItems', itemId), { available: !item.available });
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    if (window.confirm('Tem certeza que deseja excluir permanentemente este item do cardápio?')) {
      await deleteDoc(doc(db, 'menuItems', itemId));
    }
  };

  const handleAddMenuItem = async (newItem: MenuItem) => {
    await setDoc(doc(db, 'menuItems', newItem.id), newItem);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    await updateDoc(doc(db, 'orders', orderId), { status });
  };

  const handleClearAllOrders = async () => {
    if (window.confirm('Deseja limpar todos os pedidos registrados permanentemente?')) {
      const snap = await getDocs(collection(db, 'orders'));
      snap.docs.forEach((d) => deleteDoc(d.ref));
    }
  };

  const handleClearAllData = async () => {
    if (window.confirm('⚠️ ATENÇÃO: Deseja apagar definitivamente todos os dados do aplicativo? Isto removerá todos os pratos, categorias, comandas e itens do carrinho.')) {
      const [menuSnap, catSnap, orderSnap] = await Promise.all([
        getDocs(collection(db, 'menuItems')),
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'orders')),
      ]);
      menuSnap.docs.forEach((d) => deleteDoc(d.ref));
      catSnap.docs.forEach((d) => deleteDoc(d.ref));
      orderSnap.docs.forEach((d) => deleteDoc(d.ref));
      setCart([]);
      alert('Limpeza total concluída! O aplicativo está completamente em branco.');
    }
  };

  const handleUpdateItem = async (updatedItem: MenuItem) => {
    await setDoc(doc(db, 'menuItems', updatedItem.id), updatedItem);
  };

  const handleAddCategory = async (newCat: Category) => {
    await setDoc(doc(db, 'categories', newCat.id), newCat);
  };

  const handleDeleteCategory = async (catId: string) => {
    await deleteDoc(doc(db, 'categories', catId));
  };

  // --- Computed ---
  const tableOrders = orders.filter((o) => o.tableNumber === selectedTable);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center gap-5 px-4">
        <div className="w-10 h-10 border-[3px] border-[#f48000] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-mono text-stone-400 uppercase tracking-[0.2em] font-semibold">
          Carregando cardápio...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 font-sans selection:bg-amber-600/10 selection:text-amber-800 flex flex-col" id="main-application-frame">

      {/* 1. SELECTION PORTAL */}
      {appMode === 'portal' && (
        <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full my-auto" id="portal-landing">
          <div className="text-center mb-10 flex flex-col items-center">
            <div className="p-4 bg-orange-50 rounded-full mb-4 border border-orange-100 shadow-xs animate-bounce" style={{ animationDuration: '3s' }}>
              <IceCream size={48} className="text-[#f48000] fill-transparent stroke-[1.5]" />
            </div>
            <h1 className="font-sans text-4xl sm:text-5xl font-black text-[#f48000] tracking-tight">
              Bistrô Sabor & Arte
            </h1>
            <p className="text-xs text-stone-450 font-mono tracking-widest uppercase mt-3 max-w-sm mx-auto font-black">
              PORTAL DE APLICATIVOS
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">

            {/* 1. CLIENTE CARD */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="border border-stone-200 bg-white rounded-3xl p-6 flex flex-col justify-between text-left shadow-xs hover:border-[#f48000] transition-colors"
            >
              <div className="space-y-4 mb-6">
                <span className="text-[9px] font-mono font-black uppercase tracking-widest text-[#f48000] bg-orange-50 px-2.5 py-0.5 rounded-md">
                   01 / CLIENTE
                </span>
                <h3 className="font-sans text-lg font-black text-stone-900 uppercase">Mesa & Balcão</h3>
                <p className="text-[11px] text-stone-500 leading-relaxed font-light">
                  Consulte nossa linha de sobremesas gourmet, cafés especiais e lanches artesanais. Peça diretamente para a sua mesa!
                </p>
                <div className="pt-2">
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-stone-400 mb-1.5 font-bold">
                    Sua Mesa ou Balcão:
                  </label>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#f48005] cursor-pointer"
                  >
                    {['Balcão 1', 'Balcão 2', 'Mesa 1', 'Mesa 2', 'Mesa 3', 'Mesa 4', 'Mesa 5', 'Mesa 6', 'Mesa 8', 'Mesa 10', 'Mesa 12'].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAppMode('menu')}
                className="w-full py-2.5 bg-[#f48000] hover:bg-orange-600 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-3xs border border-orange-550"
              >
                Abrir Cardápio
              </button>
            </motion.div>

            {/* 2. KDS KITCHEN CARD */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.04 }}
              className="border border-stone-200 bg-white rounded-3xl p-6 flex flex-col justify-between text-left shadow-xs hover:border-[#f48000] transition-colors"
            >
              <div className="space-y-4 mb-6">
                <span className="text-[9px] font-mono font-black uppercase tracking-widest text-[#f48000] bg-orange-50 px-2.5 py-0.5 rounded-md">
                   02 / PRODUÇÃO
                </span>
                <h3 className="font-sans text-lg font-black text-stone-900 uppercase">Painel da Cozinha</h3>
                <p className="text-[11px] text-stone-500 leading-relaxed font-light">
                  Fila Operacional KDS. Confirmação de passo a passo de preparo gourmet com verificação sob parâmetros de qualidade do Chef.
                </p>
                <div className="pt-2 space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-stone-400 font-bold">
                    Senha de Entrada:
                  </label>
                  <input
                    type="password"
                    value={kitchenPinInput}
                    onChange={(e) => { setKitchenPinInput(e.target.value); setKitchenPinError(''); }}
                    placeholder="••••"
                    className="w-full bg-stone-50 border border-stone-200 text-stone-850 text-xs rounded-xl px-3 py-2 text-center font-mono focus:outline-none focus:border-[#f48000]"
                  />
                  <div className="flex items-center justify-between text-[8px] font-mono text-stone-400">
                    <span>PADRÃO: 1234</span>
                    {kitchenPinError && <span className="text-rose-500 font-bold">{kitchenPinError}</span>}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (kitchenPinInput === '1234') {
                    setAppMode('kitchen');
                    setKitchenPinInput('');
                    setKitchenPinError('');
                  } else {
                    setKitchenPinError('PIN Inválido');
                  }
                }}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-850 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                Abrir Cozinha
              </button>
            </motion.div>

            {/* 3. ADMIN CARD */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.08 }}
              className="border border-stone-200 bg-white rounded-3xl p-6 flex flex-col justify-between text-left shadow-xs hover:border-[#f48000] transition-colors"
            >
              <div className="space-y-4 mb-6">
                <span className="text-[9px] font-mono font-black uppercase tracking-widest text-[#f48000] bg-orange-50 px-2.5 py-0.5 rounded-md">
                   03 / GESTÃO
                </span>
                <h3 className="font-sans text-lg font-black text-stone-900 uppercase">Admin & Controles</h3>
                <p className="text-[11px] text-stone-500 leading-relaxed font-light">
                  Ajustes operacionais, controle de preço e estoque ativo do cardápio digital, análise de faturamento diário e campanhas de marketing.
                </p>
                <div className="pt-2 space-y-1.5">
                  <label className="block text-[9px] font-mono uppercase tracking-wider text-stone-400 font-bold">
                    Senha de Entrada:
                  </label>
                  <input
                    type="password"
                    value={adminPinInput}
                    onChange={(e) => { setAdminPinInput(e.target.value); setPinError(''); }}
                    placeholder="••••"
                    className="w-full bg-stone-50 border border-stone-200 text-stone-850 text-xs rounded-xl px-3 py-2 text-center font-mono focus:outline-none focus:border-[#f48000]"
                  />
                  <div className="flex items-center justify-between text-[8px] font-mono text-stone-400">
                    <span>PADRÃO: 1234</span>
                    {pinError && <span className="text-rose-500 font-bold">{pinError}</span>}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (adminPinInput === '1234') {
                    setAppMode('admin');
                    setAdminPinInput('');
                    setPinError('');
                  } else {
                    setPinError('PIN Inválido');
                  }
                }}
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-850 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
              >
                Abrir Admin
              </button>
            </motion.div>

          </div>
        </div>
      )}

      {/* 2. CUSTOMER MENU MODE */}
      {appMode === 'menu' && (
        <>
          <Header
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
            openCart={() => setActiveTab('cart')}
            onBackToPortal={() => setAppMode('portal')}
          />

          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-24">

            {/* TAB 1: CARDÁPIO */}
            {activeTab === 'menu' && (
              <div className="space-y-8" id="customer-view-grid">
                <div
                  className="relative overflow-hidden rounded-[2rem] bg-[#7A3F02] text-left p-8 sm:p-12 shadow-md border border-orange-500/15 flex flex-col justify-center min-h-[170px] sm:min-h-[210px]"
                  id="doce-sabor-promo-banner"
                >
                  <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none bg-gradient-to-l from-orange-400 to-transparent rounded-r-[2rem]" />
                  <div className="relative z-10 max-w-lg space-y-2">
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-[#ffa31a] tracking-tight leading-snug">
                      O Melhor Sorvete da Cidade
                    </h2>
                    <p className="text-xs sm:text-sm text-[#FAF9F6]/90 leading-relaxed font-normal max-w-sm">
                      Sabor artesanal, ingredientes frescos e muito amor na receita.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-baseline justify-between border-b border-stone-250 pb-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-stone-400">
                      Explorar Cardápio ({filteredItems.length} itens)
                    </span>
                  </div>
                  <CategoryFilters
                    categories={categories}
                    activeCategory={activeCategory}
                    setActiveCategory={setActiveCategory}
                  />
                </div>

                {filteredItems.length === 0 ? (
                  <div className="border border-stone-200/50 rounded-3xl bg-white p-12 text-center text-stone-500 max-w-lg mx-auto shadow-2xs">
                    <p className="font-serif font-bold text-stone-700 text-lg">Nenhum prato encontrado</p>
                    <p className="text-xs text-stone-400 mt-1">Experimente buscar por outros termos ou mudar a categoria selecionada.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="menu-items-grid">
                    {filteredItems.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onSelect={(it) => setSelectedItem(it)}
                        onQuickAdd={handleQuickAdd}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SACOLA */}
            {activeTab === 'cart' && (
              <div className="space-y-8 animate-fadeIn" id="customer-cart-view">
                <div className="flex flex-col gap-2 border-b border-stone-200 pb-4 text-left">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#f48000] font-bold">Mesa/Balcão • {selectedTable}</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-stone-900">Sua Sacola de Escolhas</h2>
                </div>

                {cart.length === 0 ? (
                  <div className="border border-stone-200/55 rounded-3xl bg-white p-16 text-center max-w-md mx-auto shadow-2xs space-y-4 flex flex-col items-center">
                    <div className="p-4 bg-orange-50 rounded-full text-[#f48000] border border-orange-100">
                      <ShoppingBag size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-sans font-bold text-stone-850 text-base">Sua sacola está vazia</h3>
                      <p className="text-xs text-stone-500 leading-relaxed font-light max-w-xs">
                        Adicione deliciosos sorvetes artesanais e pratos do cardápio para fazer o seu pedido diretamente para a cozinha!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('menu')}
                      className="px-6 py-2.5 bg-[#f48000] text-white hover:bg-orange-600 font-bold text-xs uppercase tracking-wider rounded-full transition-colors cursor-pointer shadow-sm"
                    >
                      Explorar Cardápio
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                    <div className="lg:col-span-2 space-y-4" id="cart-workspace">
                      {cart.map((cartItem) => (
                        <div
                          key={cartItem.cartId}
                          className="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-stone-200 rounded-3xl shadow-xs justify-between"
                          id={`cart-item-${cartItem.cartId}`}
                        >
                          <div className="flex gap-4 items-start flex-1">
                            <img
                              src={cartItem.menuItem.imageUrl}
                              alt={cartItem.menuItem.name}
                              referrerPolicy="no-referrer"
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover bg-stone-100 transition-all border border-stone-100 rounded-2xl flex-shrink-0"
                            />
                            <div className="space-y-1 flex-1">
                              <div className="flex items-start justify-between gap-1">
                                <h4 className="font-sans text-sm sm:text-base font-bold text-stone-900 leading-snug">
                                  {cartItem.menuItem.name}
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCartItem(cartItem.cartId)}
                                  className="text-stone-400 hover:text-rose-600 transition-colors p-1 cursor-pointer rounded-full hover:bg-stone-50"
                                  id={`remove-item-${cartItem.cartId}`}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                              {Object.keys(cartItem.selectedChoices).length > 0 && (
                                <div className="space-y-1 py-1">
                                  {Object.entries(cartItem.selectedChoices).map(([optName, selectedArray]) => {
                                    const choicesList = selectedArray as OptionChoice[];
                                    if (choicesList.length === 0) return null;
                                    return (
                                      <p key={optName} className="text-[10px] text-[#f48000] font-bold uppercase tracking-wide">
                                        • {optName}: {choicesList.map((c) => c.name).join(', ')}
                                      </p>
                                    );
                                  })}
                                </div>
                              )}
                              {cartItem.notes && (
                                <div className="text-[10px] bg-stone-50 border border-stone-100 px-2.5 py-1.5 rounded-xl text-stone-650 inline-block font-light max-w-xs truncate">
                                  Obs: {cartItem.notes}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex sm:flex-col items-center justify-between sm:justify-center sm:items-end gap-3 border-t sm:border-t-0 border-stone-100 pt-3 sm:pt-0">
                            <span className="font-mono text-sm sm:text-base font-bold text-[#f48000] sm:order-1">
                              R$ {cartItem.totalPrice.toFixed(2)}
                            </span>
                            <div className="flex items-center gap-2.5 bg-stone-50 border border-stone-200 px-3 py-1 rounded-full shadow-2xs sm:order-2">
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQuantity(cartItem.cartId, -1)}
                                className="p-1 text-stone-500 hover:text-stone-900 cursor-pointer rounded-full"
                                id={`cart-qty-dec-${cartItem.cartId}`}
                              >
                                <Minus size={11} strokeWidth={2.5} />
                              </button>
                              <span className="font-mono text-xs font-bold text-stone-850 select-none w-4 text-center">
                                {cartItem.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateCartQuantity(cartItem.cartId, 1)}
                                className="p-1 text-stone-500 hover:text-[#f48000] cursor-pointer rounded-full"
                                id={`cart-qty-inc-${cartItem.cartId}`}
                              >
                                <Plus size={11} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white border border-stone-200 rounded-[2rem] p-6 shadow-xs flex flex-col justify-between h-fit space-y-6" id="cart-completion">
                      <div className="space-y-4">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold block mb-1">Finalização do Pedido</span>
                        <div className="space-y-1.5 text-left">
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#f48000] font-bold">Seu Nome / Identificação</label>
                          <input
                            type="text"
                            required
                            value={cartCustomerName}
                            onChange={(e) => setCartCustomerName(e.target.value)}
                            placeholder="Identificação do pedido..."
                            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 focus:border-[#f48000] focus:ring-1 focus:ring-[#f48000] rounded-2xl focus:outline-none text-xs text-stone-800 font-medium"
                            id="dedicated-cart-customer-name"
                          />
                        </div>
                        <div className="space-y-1.5 text-left">
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">Forma de Pagamento</label>
                          <div className="grid grid-cols-2 gap-2" id="payment-methods">
                            {['PIX', 'Cartão', 'Dinheiro', 'Vale'].map((method) => {
                              const isSelected = cartPaymentMethod === method;
                              return (
                                <button
                                  key={method}
                                  type="button"
                                  onClick={() => setCartPaymentMethod(method)}
                                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border uppercase transition-all rounded-xl justify-center cursor-pointer shadow-3xs ${
                                    isSelected
                                      ? 'border-[#f48000] bg-[#f48000] text-white font-black'
                                      : 'border-stone-250 bg-stone-50/50 text-stone-550 hover:border-[#f48000]'
                                  }`}
                                >
                                  <CreditCard size={12} />
                                  <span>{method}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="pt-4 border-t border-stone-150 space-y-2">
                          <div className="flex justify-between text-xs text-stone-500 font-light">
                            <span>Subtotal dos itens:</span>
                            <span className="font-mono">R$ {cart.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-[13px] font-bold text-[#f48000] pt-2 border-t border-stone-100">
                            <span>TOTAL EMBALADO:</span>
                            <span className="font-mono text-base">R$ {cart.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!cartCustomerName.trim()) {
                            alert('Por favor, informe seu nome ou identificação para finalizar o pedido!');
                            return;
                          }
                          handleSubmitOrder(cartCustomerName, cartPaymentMethod);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#f48000] hover:bg-orange-600 border border-[#f48000] text-white font-bold uppercase rounded-full text-xs tracking-wider transition-all cursor-pointer shadow-md"
                        id="dedicated-submit-order-btn"
                      >
                        <span>ENVIAR PARA COZINHA</span>
                        <ArrowRight size={13} strokeWidth={2.5} className="animate-pulse" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PEDIDOS */}
            {activeTab === 'orders' && (
              <div className="space-y-8 animate-fadeIn text-left" id="customer-orders-view">
                <div className="flex flex-col gap-2 border-b border-stone-200 pb-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#f48000] font-bold">Mesa/Balcão • {selectedTable}</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-stone-900">Acompanhar Preparos</h2>
                </div>

                {tableOrders.length === 0 ? (
                  <div className="border border-stone-200/50 rounded-3xl bg-white p-16 text-center max-w-md mx-auto shadow-2xs space-y-4 flex flex-col items-center">
                    <div className="p-4 bg-orange-50 rounded-full text-[#f48000] border border-orange-100">
                      <ClipboardList size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-sans font-bold text-stone-850 text-base">Nenhum pedido enviado</h3>
                      <p className="text-xs text-stone-550 leading-relaxed font-light max-w-xs">
                        Você não possui nenhum preparo pendente ou em andamento para esta mesa ainda.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('menu')}
                      className="px-6 py-2.5 bg-[#f48000] text-white hover:bg-orange-600 font-bold text-xs uppercase tracking-wider rounded-full transition-colors cursor-pointer shadow-sm"
                    >
                      Explorar Cardápio
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="orders-live-tracker">
                    {tableOrders.map((order) => {
                      const statusSteps = [
                        { key: 'pending', label: 'Recebido', icon: <Clock size={12} /> },
                        { key: 'preparing', label: 'Em Preparo', icon: <ChefHat size={12} /> },
                        { key: 'ready', label: 'Pronto!', icon: <Sparkles size={12} /> },
                        { key: 'delivered', label: 'Entregue', icon: <CheckCircle2 size={12} /> },
                      ];
                      const currentStatusIndex = statusSteps.findIndex((s) => s.key === order.status);
                      return (
                        <div key={order.id} className="bg-white border border-stone-150 rounded-3xl p-6 space-y-5 shadow-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                            <div>
                              <span className="text-[10px] font-mono text-stone-400 font-bold block">PEDIDO #{order.id.slice(-6).toUpperCase()}</span>
                              <h5 className="font-sans text-xs sm:text-sm font-bold text-stone-850">
                                Para: <span className="text-[#f48000]">{order.customerName}</span>
                              </h5>
                            </div>
                            <div className="text-left sm:text-right">
                              <span className="font-mono text-xs sm:text-sm font-bold text-[#f48000]">
                                Total: R$ {order.totalPrice.toFixed(2)}
                              </span>
                              <p className="text-[9px] font-mono text-stone-400">Forma: {order.paymentMethod} • Mesa: {order.tableNumber}</p>
                            </div>
                          </div>
                          <div className="text-xs text-stone-600 font-light space-y-1.5">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-[#f48000] font-bold block mb-1">Itens Adquiridos</span>
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between items-center text-stone-750 font-medium">
                                <span>
                                  <strong className="font-bold text-stone-900 pr-1">{it.quantity}x</strong> {it.menuItemName || it.menuItem?.name}
                                </span>
                                {it.notes && <span className="text-[10px] italic text-stone-450">("{it.notes}")</span>}
                              </div>
                            ))}
                          </div>
                          <div className="pt-3 border-t border-stone-100 pb-1">
                            <div className="grid grid-cols-4 gap-1 relative">
                              <div className="absolute top-[14px] left-[12%] right-[12%] h-[2px] bg-stone-100 -z-0" />
                              {currentStatusIndex > 0 && (
                                <div
                                  className="absolute top-[14px] left-[12%] h-[2px] bg-[#f48000] transition-all duration-500 -z-0"
                                  style={{ width: `${(currentStatusIndex / 3) * 76}%` }}
                                />
                              )}
                              {statusSteps.map((step, idx) => {
                                const isCompleted = idx <= currentStatusIndex;
                                const isActive = idx === currentStatusIndex;
                                return (
                                  <div key={step.key} className="flex flex-col items-center text-center z-10">
                                    <div
                                      className={`w-[30px] h-[30px] rounded-full flex items-center justify-center transition-all border ${
                                        isActive
                                          ? 'bg-[#f48000] border-[#f48000] text-white shadow-sm ring-4 ring-orange-100'
                                          : isCompleted
                                            ? 'bg-[#f48000]/10 border-[#f48000] text-[#f48000]'
                                            : 'bg-white border-stone-200 text-stone-400'
                                      }`}
                                    >
                                      {step.icon}
                                    </div>
                                    <span
                                      className={`text-[9px] mt-2 font-sans uppercase tracking-wider block ${
                                        isActive
                                          ? 'text-[#f48000] font-black'
                                          : isCompleted
                                            ? 'text-stone-850 font-bold'
                                            : 'text-stone-400'
                                      }`}
                                    >
                                      {step.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SOBRE */}
            {activeTab === 'about' && (
              <div className="space-y-8 animate-fadeIn text-left" id="customer-about-view">
                <div className="flex flex-col gap-2 border-b border-stone-200 pb-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#f48000] font-bold">Nossa Casa & Avaliações</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-stone-900">Sobre o Doce Sabor</h2>
                </div>
                <AboutSection reviews={MOCK_REVIEWS} />
              </div>
            )}
          </main>

          {/* Floating Nav */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md bg-[#121212]/95 backdrop-blur-md border border-stone-850 rounded-[2rem] px-2 py-2 shadow-2xl flex justify-around items-center" id="floating-nav-dock">
            <button
              type="button"
              onClick={() => { setActiveTab('menu'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`flex items-center gap-1 py-2 px-3 text-[11px] sm:text-xs font-bold transition-all duration-300 rounded-full cursor-pointer ${
                activeTab === 'menu' ? 'bg-[#f48000] text-white shadow-md' : 'text-[#f48000] hover:text-[#ffa31a] hover:bg-white/5'
              }`}
            >
              <Home size={14} strokeWidth={activeTab === 'menu' ? 3 : 2} />
              {activeTab === 'menu' && <span>Cardápio</span>}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cart')}
              className={`relative flex items-center gap-1 py-2 px-3 text-[11px] sm:text-xs font-bold transition-all duration-300 rounded-full cursor-pointer ${
                activeTab === 'cart' ? 'bg-[#f48000] text-white shadow-md' : 'text-[#f48000] hover:text-[#ffa31a] hover:bg-white/5'
              }`}
              id="dock-cart-btn"
            >
              <ShoppingBag size={14} strokeWidth={activeTab === 'cart' ? 3 : 2} />
              {activeTab === 'cart' && <span>Sacola</span>}
              {cart.reduce((s, i) => s + i.quantity, 0) > 0 && (
                <span className={`absolute -top-1 -right-2 flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1 text-[8px] font-mono font-black border leading-none ${
                  activeTab === 'cart' ? 'bg-white border-[#f48000] text-[#f48000]' : 'bg-[#f48000] border-[#121212] text-white'
                }`}>
                  {cart.reduce((s, i) => s + i.quantity, 0)}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`relative flex items-center gap-1 py-2 px-3 text-[11px] sm:text-xs font-bold transition-all duration-300 rounded-full cursor-pointer ${
                activeTab === 'orders' ? 'bg-[#f48000] text-white shadow-md' : 'text-[#f48000] hover:text-[#ffa31a] hover:bg-white/5'
              }`}
              id="dock-orders-btn"
            >
              <ClipboardList size={14} strokeWidth={activeTab === 'orders' ? 3 : 2} />
              {activeTab === 'orders' && <span>Pedidos</span>}
              {tableOrders.length > 0 && (
                <span className={`absolute -top-1 -right-2 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[8px] font-mono font-black border leading-none ${
                  activeTab === 'orders' ? 'bg-white border-[#f48000] text-[#f48000]' : 'bg-[#f48000] border-[#121212] text-white'
                }`}>
                  {tableOrders.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className={`flex items-center gap-1 py-2 px-3 text-[11px] sm:text-xs font-bold transition-all duration-300 rounded-full cursor-pointer ${
                activeTab === 'about' ? 'bg-[#f48000] text-white shadow-md' : 'text-[#f48000] hover:text-[#ffa31a] hover:bg-white/5'
              }`}
              id="dock-about-btn"
            >
              <Info size={14} strokeWidth={activeTab === 'about' ? 3 : 2} />
              {activeTab === 'about' && <span>Sobre</span>}
            </button>
          </div>
        </>
      )}

      {/* 3. ADMIN */}
      {appMode === 'admin' && (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <AdminPanel
            menuItems={menuItems}
            categories={categories}
            orders={orders}
            onToggleAvailability={handleToggleAvailability}
            onDeleteItem={handleDeleteMenuItem}
            onAddItem={handleAddMenuItem}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onClearAllOrders={handleClearAllOrders}
            onBackToPortal={() => setAppMode('portal')}
            onUpdateItem={handleUpdateItem}
            onNavigateTo={(mode: any) => setAppMode(mode)}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onClearAllData={handleClearAllData}
          />
        </main>
      )}

      {/* 4. KITCHEN KDS */}
      {appMode === 'kitchen' && (
        <KitchenKDS
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onNavigateTo={(mode: any) => setAppMode(mode)}
        />
      )}

      {/* Cart Sidebar */}
      <CartSidebar
        items={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onRemoveItem={handleRemoveCartItem}
        onUpdateQuantity={handleUpdateCartQuantity}
        onSubmitOrder={handleSubmitOrder}
        selectedTable={selectedTable}
      />

      {/* Customize Modal */}
      <ItemCustomizeModal
        item={selectedItem}
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Order Success Modal */}
      <AnimatePresence>
        {successOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-950/70"
              onClick={() => setSuccessOrder(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[#FAF9F6] border border-stone-300 p-6 text-center select-none z-10 space-y-5"
              id="order-success-screen"
            >
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-stone-400 block mb-1">✓ ENVIADO</span>
                <h3 className="font-serif text-lg font-bold text-stone-900 leading-tight">Pedido Confirmado</h3>
                <p className="text-[11px] text-stone-500 font-mono mt-1">
                  Mesa: {successOrder.tableNumber} • ID: #{successOrder.id.slice(-6).toUpperCase()}
                </p>
              </div>
              <div className="border border-stone-200 p-4 bg-transparent text-left space-y-2">
                <span className="text-[9px] font-mono uppercase tracking-widest text-stone-450">Resumo:</span>
                <div className="max-h-[140px] overflow-y-auto space-y-1 pt-1.5 border-t border-stone-200">
                  {successOrder.items.map((it, i) => (
                    <div key={i} className="text-xs flex justify-between font-light">
                      <span className="text-stone-700 truncate max-w-[180px]">{it.quantity}x {it.menuItem.name}</span>
                      <span className="font-mono text-stone-500">R$ {it.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-stone-200 pt-2 flex justify-between font-bold text-stone-900 text-xs font-mono">
                  <span>TOTAL:</span>
                  <span>R$ {successOrder.totalPrice.toFixed(2)}</span>
                </div>
              </div>
              <div className="border border-stone-200 p-3 bg-white text-[10px] text-stone-500 leading-relaxed text-left font-light">
                Para visualizar as etapas de preparo, retorne ao portal inicial e use o PIN <span className="font-mono font-semibold">1234</span> para acessar a cozinha em tempo real.
              </div>
              <button
                type="button"
                onClick={() => setSuccessOrder(null)}
                className="w-full py-2.5 bg-stone-900 hover:bg-[#FAF9F6] hover:text-stone-900 border border-stone-900 text-white text-xs font-mono uppercase tracking-wider transition-all duration-150 cursor-pointer"
                id="close-success-popup-btn"
              >
                Prosseguir
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#f48000] text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold text-xs uppercase tracking-wide border border-orange-400"
            id="toast-notification"
          >
            <CheckCircle2 size={14} className="text-white fill-transparent stroke-[3]" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="bg-[#FAF9F6] text-stone-400 py-8 text-center text-[10px] mt-auto border-t border-stone-200 font-mono tracking-widest uppercase">
        <p>© 2026 Bistrô Sabor & Arte • Menus Digitais</p>
      </footer>
    </div>
  );
}