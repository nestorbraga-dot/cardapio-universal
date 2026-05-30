import React, { useState } from 'react';
import { MenuItem, Category, Order, OptionChoice } from '../types';
import { 
  Trash2, 
  Clock, 
  Search, 
  TrendingUp, 
  Package, 
  Check, 
  ChefHat, 
  Plus,
  Sliders, 
  Eye, 
  EyeOff, 
  Edit3, 
  PlusCircle, 
  CreditCard, 
  Info,
  Layers,
  Image as ImageIcon,
  CheckCircle,
  HelpCircle,
  TrendingDown,
  X,
  Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Extended props to support full operations
interface AdminPanelProps {
  menuItems: MenuItem[];
  categories: Category[];
  orders: Order[];
  onToggleAvailability: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onAddItem: (newItem: MenuItem) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onClearAllOrders: () => void;
  onBackToPortal: () => void;
  onUpdateItem?: (updatedItem: MenuItem) => void; 
  onNavigateTo?: (mode: 'menu' | 'kitchen' | 'portal') => void;
  onAddCategory?: (newCategory: Category) => void;
  onDeleteCategory?: (categoryId: string) => void;
  onClearAllData?: () => void;
}

export default function AdminPanel({
  menuItems,
  categories,
  orders,
  onToggleAvailability,
  onDeleteItem,
  onAddItem,
  onUpdateOrderStatus,
  onClearAllOrders,
  onBackToPortal,
  onUpdateItem,
  onNavigateTo,
  onAddCategory,
  onDeleteCategory,
  onClearAllData
}: AdminPanelProps) {
  // Navigation tabs exactly from screenshot 2
  // 'inventory' = Cardápio/Itens, 'categories' = Categorias, 'billing' = Faturamento, 'banner' = Imagem/Banner
  const [activeTab, setActiveTab] = useState<'inventory' | 'categories' | 'billing' | 'banner'>('inventory');

  // Interactive store visibility toggle state ("Loja Aberta")
  const [storeOpen, setStoreOpen] = useState(() => {
    const saved = localStorage.getItem('store_receptivity_open');
    return saved !== 'false';
  });

  const toggleStoreStatus = () => {
    const nextState = !storeOpen;
    setStoreOpen(nextState);
    localStorage.setItem('store_receptivity_open', String(nextState));
  };

  // Add Item / Edit Item modal control states
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form Field States
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategory, setFormCategory] = useState('sorvetes');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formPrepTime, setFormPrepTime] = useState('15 min');
  const [formIngredients, setFormIngredients] = useState('');
  const [formTags, setFormTags] = useState('');

  // Form Category States
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Hidden/Visible simulation list to support "Visível" toggle in the table
  const [invisibleItemIds, setInvisibleItemIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('admin_invisible_items');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleVisibility = (itemId: string) => {
    let nextList = [...invisibleItemIds];
    if (nextList.includes(itemId)) {
      nextList = nextList.filter(id => id !== itemId);
    } else {
      nextList.push(itemId);
    }
    setInvisibleItemIds(nextList);
    localStorage.setItem('admin_invisible_items', JSON.stringify(nextList));
  };

  // Search and Category filtering
  const [invSearchQuery, setInvSearchQuery] = useState('');
  const [invCategoryFilter, setInvCategoryFilter] = useState('all');

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(invSearchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(invSearchQuery.toLowerCase());
    const matchesCategory = invCategoryFilter === 'all' || item.category === invCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Financial calculations for Faturamento tab
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const pendingOrders = orders.filter(o => o.status !== 'delivered');

  const salesTotal = deliveredOrders.reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingSalesTotal = pendingOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  // Payment Breakdown
  const paymentBreakdown = deliveredOrders.reduce((acc, order) => {
    const method = order.paymentMethod || 'PIX';
    acc[method] = (acc[method] || 0) + order.totalPrice;
    return acc;
  }, {} as { [key: string]: number });

  // Best Sellers Calculations
  const itemSalesCount = deliveredOrders.reduce((acc, order) => {
    order.items.forEach(it => {
      const id = it.menuItem.id;
      if (!acc[id]) {
        acc[id] = {
          name: it.menuItem.name,
          category: it.menuItem.category,
          quantity: 0,
          revenue: 0,
          imageUrl: it.menuItem.imageUrl
        };
      }
      acc[id].quantity += it.quantity;
      acc[id].revenue += it.totalPrice;
    });
    return acc;
  }, {} as { [key: string]: { name: string; category: string; quantity: number; revenue: number; imageUrl: string } });

  const bestSellers = Object.values(itemSalesCount).sort((a, b) => b.quantity - a.quantity);

  // Home Cover Cover Presets for Imagem/Banner
  const [storeCover, setStoreCover] = useState(() => {
    return localStorage.getItem('app_promo_cover_preset') || 'Chocolate Romântico';
  });

  const coverPresets = [
    { name: 'Chocolate Romântico', url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1200&q=80', tagline: 'Sabores quentes, sensações frias.' },
    { name: 'Sobremesa de Morango', url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=1200&q=80', tagline: 'Vermelho doce que apaixona.' },
    { name: 'Café da Manhã Bistro', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80', tagline: 'Para começar o dia com energia.' },
    { name: 'Sorvetes de Verão', url: 'https://images.unsplash.com/photo-1501443715937-6131fdf8f449?auto=format&fit=crop&w=1200&q=80', tagline: 'Fresco, gelado, maravilhoso.' }
  ];

  const handleSelectPreset = (name: string, url: string) => {
    setStoreCover(name);
    localStorage.setItem('app_promo_cover_preset', name);
    localStorage.setItem('app_promo_cover_picture', url);
  };

  const handleOpenAddModal = () => {
    setFormName('');
    setFormDesc('');
    setFormPrice('');
    setFormCategory(categories[0]?.id || 'sorvetes');
    setFormImageUrl('');
    setFormPrepTime('15 min');
    setFormIngredients('');
    setFormTags('');
    setIsAddingItem(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setFormName(item.name);
    setFormDesc(item.description);
    setFormPrice(String(item.price));
    setFormCategory(item.category);
    setFormImageUrl(item.imageUrl);
    setFormPrepTime(item.prepTime || '15 min');
    setFormIngredients(item.ingredients?.join(', ') || '');
    setFormTags(item.tags?.join(', ') || '');
    setEditingItem(item);
  };

  const submitAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(formPrice);
    if (!formName.trim() || isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Preencha os campos obrigatórios corretamente.');
      return;
    }

    const newItem: MenuItem = {
      id: `custom-item-${Date.now()}`,
      name: formName.trim(),
      description: formDesc.trim() || 'Doce saboroso artesanal preparado com dedicação.',
      price: parsedPrice,
      category: formCategory,
      imageUrl: formImageUrl.trim() || 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
      available: true,
      prepTime: formPrepTime.trim(),
      ingredients: formIngredients ? formIngredients.split(',').map(s => s.trim()).filter(Boolean) : ['Segredo do Chef'],
      tags: formTags ? formTags.split(',').map(s => s.trim()).filter(Boolean) : []
    };

    onAddItem(newItem);
    setIsAddingItem(false);
  };

  const submitEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const parsedPrice = parseFloat(formPrice);
    if (!formName.trim() || isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Preencha os campos obrigatórios corretamente.');
      return;
    }

    const updated: MenuItem = {
      ...editingItem,
      name: formName.trim(),
      description: formDesc.trim(),
      price: parsedPrice,
      category: formCategory,
      imageUrl: formImageUrl.trim(),
      prepTime: formPrepTime.trim(),
      ingredients: formIngredients ? formIngredients.split(',').map(s => s.trim()).filter(Boolean) : editingItem.ingredients,
      tags: formTags ? formTags.split(',').map(s => s.trim()).filter(Boolean) : editingItem.tags
    };

    if (onUpdateItem) {
      onUpdateItem(updated);
    } else {
      // Direct state mutation fallback in Admin if callback omitted
      editingItem.name = updated.name;
      editingItem.price = updated.price;
      editingItem.description = updated.description;
      editingItem.category = updated.category;
      editingItem.imageUrl = updated.imageUrl;
      editingItem.prepTime = updated.prepTime;
      editingItem.ingredients = updated.ingredients;
      editingItem.tags = updated.tags;
    }

    setEditingItem(null);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      alert('Por favor, informe o nome da categoria.');
      return;
    }

    // Generate unique slug id
    const generatedId = newCatName
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9]+/g, "-") // replace anything that is not alphanumeric with hyphens
      .replace(/(^-|-$)+/g, ""); // strip leading/trailing hyphens

    if (!generatedId) {
      alert('Nome de categoria inválido.');
      return;
    }

    // Check for duplicate id
    if (categories.some(c => c.id === generatedId)) {
      alert('Esta categoria (ou uma com identificador equivalente) já existe.');
      return;
    }

    const newCat = {
      id: generatedId,
      name: newCatName.trim(),
      icon: 'Layers', // Default icon from types
      description: newCatDesc.trim() || 'Nova seção deliciosa do nosso cardápio.'
    };

    if (onAddCategory) {
      onAddCategory(newCat);
    }
    
    // Clear fields
    setNewCatName('');
    setNewCatDesc('');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans text-stone-950 text-left select-none" id="admin-application-layer">
      
      {/* Orange Solid Navbar (matches Screenshot 2) */}
      <header className="bg-[#f48000] px-6 py-4 flex items-center justify-between text-white border-b border-orange-600 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
            <Sliders size={20} strokeWidth={2.5} />
          </div>
          <span className="font-sans font-black text-lg tracking-wider uppercase">ADMIN & CONTROLES</span>
        </div>

        {/* Status capsules and quick navigation links exactly matching screenshot 2 */}
        <div className="flex items-center gap-4.5">
          
          {/* Loja Aberta switchable capsule */}
          <button
            type="button"
            onClick={toggleStoreStatus}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase transition-all shadow-3xs cursor-pointer ${
              storeOpen 
                ? 'bg-emerald-600 border border-emerald-500 text-white font-extrabold' 
                : 'bg-rose-600 border border-rose-500 text-white font-extrabold'
            }`}
          >
            <Store size={14} />
            <span>{storeOpen ? 'Loja Aberta' : 'Loja Fechada'}</span>
          </button>

          <span className="text-white/40 font-light text-sm">|</span>

          {/* Quick Nav back to client */}
          <button
            type="button"
            onClick={() => onNavigateTo ? onNavigateTo('menu') : onBackToPortal()}
            className="text-white/95 hover:text-white font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            Loja Cliente
          </button>

          <span className="text-white/40 font-light text-sm">|</span>

          {/* Link to kitchen exactly matching screenshot */}
          <button
            type="button"
            onClick={() => onNavigateTo ? onNavigateTo('kitchen') : onBackToPortal()}
            className="text-white/95 hover:text-stone-900 font-mono text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1"
          >
            Ver Cozinha
          </button>
        </div>
      </header>

      {/* Main body with exact layout tabs pill capsule */}
      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-6">
        
        {/* Symmetrical tab bar capsule container from screenshot 2 */}
        <div className="flex flex-wrap items-center bg-white border border-stone-200 p-1.5 rounded-[1.5rem] shadow-3xs gap-1.5 w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-[1rem] text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-[#f48000] text-white font-black shadow-sm'
                : 'text-stone-500 hover:text-stone-900 bg-transparent hover:bg-stone-50'
            }`}
          >
            <Package size={14} />
            <span>Cardápio / Itens</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-[1rem] text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-[#f48000] text-white font-black shadow-sm'
                : 'text-stone-500 hover:text-stone-900 bg-transparent hover:bg-stone-50'
            }`}
          >
            <Layers size={14} />
            <span>Categorias</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-[1rem] text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'billing'
                ? 'bg-[#f48000] text-white font-black shadow-sm'
                : 'text-stone-500 hover:text-stone-900 bg-transparent hover:bg-stone-50'
            }`}
          >
            <TrendingUp size={14} />
            <span>Faturamento</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('banner')}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-[1rem] text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'banner'
                ? 'bg-[#f48000] text-white font-black shadow-sm'
                : 'text-stone-500 hover:text-stone-900 bg-transparent hover:bg-stone-50'
            }`}
          >
            <ImageIcon size={14} />
            <span>Imagem / Banner</span>
          </button>
        </div>

        {/* ACTIVE TAB VIEWS */}

        {/* TAB 1: CARDÁPIO / ITENS */}
        {activeTab === 'inventory' && (
          <div className="bg-white border border-stone-200 rounded-[2rem] p-6 shadow-xs space-y-6 animate-fadeIn">
            
            {/* Header control line: Title + plus trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-sans text-xl font-black text-stone-900 uppercase">Itens do Cardápio</h3>
                <p className="text-xs text-stone-400 font-light mt-0.5">Ativar ou inativar temporariamente itens de acordo com as vendas diárias.</p>
              </div>

              <div className="flex gap-2 items-center">
                {/* Search query input */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    value={invSearchQuery}
                    onChange={(e) => setInvSearchQuery(e.target.value)}
                    placeholder="Filtrar pratos..."
                    className="pl-8 pr-4 py-1.5 bg-stone-50 border border-stone-250 rounded-xl focus:outline-none focus:border-[#f48000] text-xs text-stone-800"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 bg-[#f48000] hover:bg-orange-600 text-white font-mono text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1 border border-orange-550 shadow-3xs"
                >
                  <Plus size={12} strokeWidth={3} />
                  <span>Novo Produto</span>
                </button>
              </div>
            </div>

            {/* Premium Table matches layout of Screenshot 2 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left" id="admin-items-table">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 text-[10px] uppercase font-mono tracking-wider font-extrabold bg-stone-50/50">
                    <th className="py-4 px-4 w-20">FOTO</th>
                    <th className="py-4 px-4">NOME / DETALHE</th>
                    <th className="py-4 px-4">CATEGORIA</th>
                    <th className="py-4 px-4">PREÇO BASE</th>
                    <th className="py-4 px-4 text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-150">
                  {filteredMenuItems.map((item) => {
                    const isVisible = !invisibleItemIds.includes(item.id);
                    return (
                      <tr key={item.id} className="hover:bg-stone-50/30 transition-colors">
                        
                        {/* 1. PHOTO ROUNDED */}
                        <td className="py-4 px-4">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover bg-stone-50 border border-stone-200/60 shadow-3xs"
                          />
                        </td>

                        {/* 2. NAME / DESCRIPTION */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-stone-900 text-sm">{item.name}</div>
                          <div className="text-xs text-stone-400 font-light truncate max-w-xs sm:max-w-md mt-0.5" title={item.description}>
                            {item.description}
                          </div>
                        </td>

                        {/* 3. CATEGORY PILL MATCHING YELLOW PILL */}
                        <td className="py-4 px-4">
                          <span className="px-3 py-1 bg-[#FAF2CF] text-[#91761F] text-[10px] font-black uppercase tracking-wider rounded-full font-sans border border-[#FAF2CF]">
                            {item.category.toUpperCase()}
                          </span>
                        </td>

                        {/* 4. BASE PRICE */}
                        <td className="py-4 px-4 font-mono font-black text-stone-900 text-sm">
                          R$ {item.price.toFixed(2)}
                        </td>

                        {/* 5. ACTIONS: TOGGLES + EDIT + TRASH */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            
                            {/* Toggle Disponível (exactly like green pill) */}
                            <button
                              type="button"
                              onClick={() => onToggleAvailability(item.id)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide border cursor-pointer transition-all ${
                                item.available
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                                  : 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100'
                              }`}
                            >
                              {item.available ? 'Disponível' : 'Esgotado'}
                            </button>

                            {/* Toggle Visível (exactly like purple pill) */}
                            <button
                              type="button"
                              onClick={() => toggleVisibility(item.id)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide border cursor-pointer transition-all ${
                                isVisible
                                  ? 'bg-[#F2EAFA] border-[#D9C4F2] text-[#8436E3] hover:bg-[#eae0f6]'
                                  : 'bg-stone-100 border-stone-250 text-stone-450 hover:bg-stone-150'
                              }`}
                            >
                              {isVisible ? 'Visível' : 'Oculto'}
                            </button>

                            {/* Pencil Edit Icon */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 bg-stone-100 hover:bg-stone-200 hover:text-stone-900 text-stone-600 rounded-lg cursor-pointer transition-colors border border-stone-220 shadow-3xs"
                              title="Editar ficha"
                            >
                              <Edit3 size={13} />
                            </button>

                            {/* Trash Icon */}
                            <button
                              type="button"
                              onClick={() => onDeleteItem(item.id)}
                              className="p-1.5 bg-stone-100 hover:bg-rose-50 hover:text-rose-600 text-stone-450 rounded-lg cursor-pointer transition-colors border border-stone-220 shadow-3xs"
                              title="Deletar produto"
                            >
                              <Trash2 size={13} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredMenuItems.length === 0 && (
              <p className="text-stone-400 py-12 text-center text-xs">Nenhum produto cadastrado corresponde aos critérios de busca.</p>
            )}

          </div>
        )}

        {/* TAB 2: CATEGORIAS */}
        {activeTab === 'categories' && (
          <div className="bg-white border border-stone-200 rounded-[2rem] p-6 shadow-xs space-y-6 animate-fadeIn">
            <div>
              <h3 className="font-sans text-xl font-black text-stone-900 uppercase font-sans">Gestão de Categorias</h3>
              <p className="text-xs text-stone-400">Organize os produtos da loja em seções ordenadas de acesso rápido no Tablet do Cliente.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* List categories */}
              <div className="space-y-4">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#f48000] block">Categorias Ativas ({categories.length})</span>
                <div className="divide-y divide-stone-150 border border-stone-200 bg-[#FAF9F6] rounded-2xl overflow-hidden shadow-3xs">
                  {categories.map((cat, idx) => (
                    <div key={cat.id || idx} className="flex justify-between items-center p-4 bg-white hover:bg-stone-50/50 transition-colors">
                      <div className="space-y-0.5">
                        <span className="font-bold text-stone-850 text-sm uppercase">{cat.name}</span>
                        <p className="text-[10px] text-stone-400 font-light max-w-xs">{cat.description}</p>
                        <p className="text-[9px] font-mono text-stone-400 font-extrabold uppercase">Identificador: {cat.id}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 bg-stone-100 text-stone-705 text-[10px] font-bold rounded-lg font-mono">
                          {menuItems.filter(i => i.category === cat.id).length} itens
                        </span>
                        
                        {onDeleteCategory && (
                          <button
                            type="button"
                            onClick={() => {
                              const itemsInCat = menuItems.filter(i => i.category === cat.id).length;
                              let msg = `Deseja realmente excluir a categoria "${cat.name}"?`;
                              if (itemsInCat > 0) {
                                msg += ` Atenção: existem ${itemsInCat} pratos cadastrados nesta categoria que ficarão temporariamente sem seção correspondente.`;
                              }
                              if (window.confirm(msg)) {
                                onDeleteCategory(cat.id);
                              }
                            }}
                            className="p-2 bg-stone-50 hover:bg-rose-50 hover:text-rose-600 text-stone-400 hover:border-rose-200 rounded-xl cursor-pointer transition-colors border border-stone-200 shadow-3xs"
                            title="Excluir categoria"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form and Disclaimer */}
              <div className="space-y-6">
                {/* Form column box */}
                <div className="p-5 bg-[#FAF9F6] border border-stone-200 rounded-2xl shadow-3xs text-left space-y-4">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#f48000] block">Nova Categoria</span>
                  <form onSubmit={handleCreateCategory} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 block">Nome da Categoria</label>
                      <input
                        type="text"
                        required
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="Ex: Cafés Especiais, Waffles, Entradas"
                        className="w-full px-3 py-2 border border-stone-250 bg-white rounded-xl text-xs focus:outline-none focus:border-[#f48000]"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500 block">Descrição Curta</label>
                      <input
                        type="text"
                        value={newCatDesc}
                        onChange={(e) => setNewCatDesc(e.target.value)}
                        placeholder="Ex: Grãos selecionados moídos na hora e cappuccinos."
                        className="w-full px-3 py-2 border border-stone-250 bg-white rounded-xl text-xs focus:outline-none focus:border-[#f48000]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-[#f48000] hover:bg-orange-600 text-white font-mono text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-orange-550 shadow-3xs"
                    >
                      <Plus size={11} strokeWidth={3} />
                      <span>Adicionar Categoria</span>
                    </button>
                  </form>
                </div>

                {/* Categorias tutorial disclaimer */}
                <div className="p-5 bg-orange-50/40 border border-orange-200/50 rounded-2xl flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-[#f48000]">
                      <Layers size={16} />
                    </div>
                    <h4 className="text-stone-900 font-sans font-bold text-sm uppercase">Estrutura Inteligente</h4>
                    <p className="text-xs text-stone-600 font-light leading-relaxed">
                      Nossas categorias estão acopladas diretamente ao tablet com indexadores semânticos de renderização. Ao associar um produto a qualquer categoria cadastrada, ela surgirá instantaneamente na barra de navegação flutuante inferior do cliente.
                    </p>
                  </div>

                  <div className="text-[10px] font-mono text-stone-400 flex items-center gap-1 bg-white border border-stone-200 px-3 py-1.5 rounded-lg w-fit">
                    <Info size={11} className="text-[#f48000]" />
                    <span>Dúvidas em customização? Contate o Administrador.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FATURAMENTO & CAIXA */}
        {activeTab === 'billing' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Financial metrics grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-stone-200 p-4.5 bg-white rounded-2xl shadow-3xs text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#f48000] font-bold">Faturamento (Líquido)</span>
                  <TrendingUp size={16} className="text-[#f48000]" />
                </div>
                <div className="font-mono text-xl font-black text-stone-900 mt-1.5">R$ {salesTotal.toFixed(2)}</div>
                <div className="text-[9px] text-stone-400 mt-1 font-mono uppercase font-bold">Apenas Comandas Entregues</div>
              </div>

              <div className="border border-stone-200 p-4.5 bg-white rounded-2xl shadow-3xs text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#f48000] font-bold">Arrecadação Potencial</span>
                  <Clock size={16} className="text-amber-500" />
                </div>
                <div className="font-mono text-xl font-black text-stone-900 mt-1.5">R$ {pendingSalesTotal.toFixed(2)}</div>
                <div className="text-[9px] text-stone-400 mt-1 font-mono uppercase">Itens Sendo Preparados</div>
              </div>

              <div className="border border-stone-200 p-4.5 bg-white rounded-2xl shadow-3xs text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#f48000] font-bold">Ticket Médio</span>
                  <CreditCard size={16} className="text-stone-600" />
                </div>
                <div className="font-mono text-xl font-black text-stone-900 mt-1.5">
                  R$ {(salesTotal > 0 ? salesTotal / deliveredOrders.length : 0).toFixed(2)}
                </div>
                <div className="text-[9px] text-stone-400 mt-1 font-mono uppercase">Média Por Comanda Fechada</div>
              </div>

              <div className="border border-stone-200 p-4.5 bg-white rounded-2xl shadow-3xs text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#f48000] font-bold">Giro de Comandas</span>
                  <ChefHat size={16} className="text-stone-880" />
                </div>
                <div className="font-mono text-xl font-black text-stone-900 mt-1.5">
                  {deliveredOrders.length} <span className="text-stone-400 font-light text-sm">/ {orders.length}</span>
                </div>
                <div className="text-[9px] text-stone-400 mt-1 font-mono uppercase">Comandas Fechadas / Totais</div>
              </div>
            </div>

            {/* Split Breakdown Graphics panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              
              {/* Payment Split Chart panel */}
              <div className="bg-white border border-stone-200 rounded-[2rem] p-6 shadow-xs text-left space-y-4">
                <h4 className="font-sans text-sm font-black text-stone-900 uppercase">Formas de Pagamento Arrecadadas</h4>
                
                <div className="space-y-4 pt-2">
                  {['PIX', 'Cartão', 'Dinheiro', 'Vale'].map(method => {
                    const value = paymentBreakdown[method] || 0;
                    const percent = salesTotal > 0 ? Math.round((value / salesTotal) * 100) : 0;
                    return (
                      <div key={method} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-stone-850">
                          <span>{method}</span>
                          <span className="font-mono font-black text-[#f48000]">R$ {value.toFixed(2)} ({percent}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-stone-100 rounded-full border border-stone-150 overflow-hidden">
                          <div 
                            className="h-full bg-[#f48000] rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-[10px] text-stone-450 bg-stone-50 border border-stone-150 p-3 rounded-xl inline-block w-full">
                  • <strong>Nota de prestação:</strong> Os valores indicados são computados no momento em que a copa/cozinha e os garçons marcam com segurança o prato como "Servido / Entregue" no KDS.
                </div>
              </div>

              {/* Best sellers */}
              <div className="bg-white border border-stone-200 rounded-[2rem] p-6 shadow-xs text-left space-y-4">
                <h4 className="font-sans text-sm font-black text-stone-900 uppercase">Campeões de Vendas (Best-Sellers)</h4>
                
                <div className="space-y-3 pt-2">
                  {bestSellers.slice(0, 5).map((seller, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-stone-50/50 hover:bg-stone-50 border border-stone-200 p-2.5 rounded-xl text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-stone-400 font-extrabold w-4">{idx + 1}.</span>
                        <img 
                          src={seller.imageUrl} 
                          alt="" 
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-lg object-cover bg-stone-100 border border-stone-200" 
                        />
                        <div>
                          <strong className="text-stone-900">{seller.name}</strong>
                          <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded ml-2 uppercase font-mono">{seller.category}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-stone-900">{seller.quantity} unidades</span>
                        <p className="text-[10px] font-mono text-[#f48000] font-bold">R$ {seller.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}

                  {bestSellers.length === 0 && (
                    <div className="py-12 text-center text-stone-400 text-xs">Nenhum prato faturado nas comandas de hoje ainda.</div>
                  )}
                </div>
              </div>

            </div>

            {/* Danger Area and clear orders option */}
            <div className="space-y-4">
              <div className="bg-[#FFF4E5] border border-orange-250 rounded-2xl p-5 text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-black text-orange-850 uppercase tracking-widest bg-orange-100 px-2.5 py-0.5 rounded">Zona Operacional</span>
                  <h5 className="font-sans text-stone-900 font-black text-sm uppercase">Fechar o Turno de Hoje</h5>
                  <p className="text-xs text-stone-600 font-light max-w-xl">Isto apagará com segurança todo o histórico local de comandas finalizadas, preparando o faturamento para o turno do próximo dia.</p>
                </div>

                <button
                  type="button"
                  onClick={onClearAllOrders}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-mono text-[9px] font-black uppercase tracking-wider rounded-xl transition-all shadow-3xs cursor-pointer border border-rose-650 shrink-0"
                >
                  Limpar Turno de Caixa
                </button>
              </div>

              {onClearAllData && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-black text-rose-850 uppercase tracking-widest bg-rose-100 px-2.5 py-0.5 rounded">Zerar Sistema</span>
                    <h5 className="font-sans text-stone-900 font-black text-sm uppercase">Apagar Todos os Dados</h5>
                    <p className="text-xs text-stone-600 font-light max-w-xl">Isto removerá definitivamente todos os produtos, categorias, comandas e carrinhos criados no aplicativo, redefinindo as configurações para o estado original em branco.</p>
                  </div>

                  <button
                    type="button"
                    onClick={onClearAllData}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-mono text-[9px] font-black uppercase tracking-wider rounded-xl transition-all shadow-3xs cursor-pointer border border-rose-750 shrink-0 flex items-center gap-1"
                  >
                    <Trash2 size={11} />
                    <span>Zerar Todos os Dados</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 4: IMAGEM / BANNER PRESETS */}
        {activeTab === 'banner' && (
          <div className="bg-white border border-stone-200 rounded-[2rem] p-6 shadow-xs space-y-6 animate-fadeIn">
            <div>
              <h3 className="font-sans text-xl font-black text-stone-900 uppercase font-sans">Campanhas & Banner de Capa</h3>
              <p className="text-xs text-stone-400">Modificar instantaneamente a imagem de chamada promocional do topo da loja cliente para datas especiais ou festivais.</p>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#f48000]">Preset de Capa Selecionado: {storeCover}</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                {coverPresets.map((preset) => {
                  const isSelected = storeCover === preset.name;
                  return (
                    <div 
                      key={preset.name}
                      onClick={() => handleSelectPreset(preset.name, preset.url)}
                      className={`border bg-white rounded-2xl overflow-hidden shadow-3xs cursor-pointer hover:border-[#f48000] transition-all flex flex-col justify-between ${
                        isSelected ? 'border-[#f48000] ring-2 ring-orange-100' : 'border-stone-200'
                      }`}
                    >
                      <img 
                        src={preset.url} 
                        alt={preset.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-24 object-cover object-center bg-stone-100" 
                      />
                      <div className="p-4 space-y-1">
                        <strong className="text-xs uppercase font-sans font-black text-stone-900 block">{preset.name}</strong>
                        <span className="text-[10px] text-stone-450 font-light block line-clamp-1">{preset.tagline}</span>
                      </div>
                      
                      <div className="px-4 pb-4.5 flex justify-end">
                        <div className={`px-2.5 py-1 text-[9px] font-mono font-extrabold uppercase rounded ${
                          isSelected ? 'bg-[#f48000] text-white' : 'bg-stone-50 text-stone-400 border border-stone-150'
                        }`}>
                          {isSelected ? 'Ativo' : 'Selecionar'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cover Preview mockup */}
              <div className="pt-6">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#f48000] block mb-2">Simulação de Capa Promocional do Cliente:</span>
                <div className="relative overflow-hidden rounded-3xl bg-[#7A3F02] text-left p-8 sm:p-12 shadow px-8 h-44 flex flex-col justify-center">
                  {/* Photo wallpaper */}
                  <img 
                    src={coverPresets.find(p => p.name === storeCover)?.url} 
                    alt=""
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 z-0" 
                  />
                  <div className="absolute inset-0 bg-[#7A3F02]/85 md:bg-transparent md:bg-gradient-to-r md:from-[#512701] md:to-transparent z-0" />

                  <div className="relative z-10 max-w-sm space-y-2">
                    <span className="text-[9px] font-mono uppercase bg-[#f48000] text-white px-2 py-0.5 rounded font-black w-fit block">Banner Ativo</span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#ffa31a] tracking-tight uppercase leading-snug">
                      O Melhor Sorvete da Cidade
                    </h2>
                    <p className="text-[10px] sm:text-xs text-[#FAF9F6] font-light max-w-xs leading-relaxed">
                      Sabor artesanal, ingredientes frescos e muito amor na receita.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* POPUPS & MODALS COVERS */}

      {/* MODAL 1: ADICIONAR PRODUTO */}
      <AnimatePresence>
        {isAddingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-950/70"
              onClick={() => setIsAddingItem(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-stone-300 rounded-[2rem] p-6 shadow-2xl relative w-full max-w-2xl overflow-y-auto max-h-[90vh]"
            >
              <button
                type="button"
                onClick={() => setIsAddingItem(false)}
                className="absolute right-6 top-6 p-1.5 hover:bg-stone-100 rounded-full cursor-pointer text-stone-400 hover:text-stone-999 transition-colors"
              >
                <X size={16} />
              </button>

              <div className="mb-6 flex items-center gap-2">
                <PlusCircle size={20} className="text-[#f48000]" />
                <h4 className="font-sans text-base font-black text-stone-900 uppercase">Cadastrar Novo Produto</h4>
              </div>

              <form onSubmit={submitAddItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-450 block text-left">Nome do Produto</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex: Taça Prestígio Suprema"
                      className="w-full px-3 py-2 border border-stone-250 bg-stone-50 rounded-xl text-xs focus:outline-none focus:border-[#f48000]"
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-450 block text-left">Preço Base (Em R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="Ex: 24.90"
                      className="w-full px-3 py-2 border border-stone-250 bg-stone-50 rounded-xl text-xs focus:outline-none focus:border-[#f48000]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category select block */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-450 block text-left">Categoria do Cardápio</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-250 bg-stone-50 rounded-xl text-xs focus:outline-none focus:border-[#f48000] cursor-pointer"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  {/* Image illustration link URL placeholder */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-450 block text-left">URL da Imagem Ilustrativa</label>
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="Foto via Unsplash"
                      className="w-full px-3 py-2 border border-stone-250 bg-stone-50 rounded-xl text-xs focus:outline-none focus:border-[#f48000]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-450 block text-left">Descrição Detalhada do Item</label>
                  <textarea
                    required
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Bolas de sorvete, trufa de chocolate, coco ralado..."
                    className="w-full h-16 px-3 py-2 border border-stone-250 bg-stone-50 rounded-xl text-xs focus:outline-none focus:border-[#f48000] resize-none"
                  />
                </div>

                {/* Prep steps config helper lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-450 block text-left">Ingredientes (Separados por vírgula)</label>
                    <input
                      type="text"
                      value={formIngredients}
                      onChange={(e) => setFormIngredients(e.target.value)}
                      placeholder="Morango fresco, calda de avelã..."
                      className="w-full px-3 py-2 border border-stone-250 bg-stone-50 rounded-xl text-xs focus:outline-none focus:border-[#f48000]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-450 block text-left">Etiquetas / Promocionais (Separados por vírgula)</label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="Novo, Vegano, Artesanal..."
                      className="w-full px-3 py-2 border border-stone-250 bg-stone-50 rounded-xl text-xs focus:outline-none focus:border-[#f48000]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-stone-150">
                  <button
                    type="button"
                    onClick={() => setIsAddingItem(false)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-stone-250"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#f48000] hover:bg-orange-600 border border-orange-550 shadow-3xs text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Salvar Produto
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: EDITAR PRODUTO */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-950/70"
              onClick={() => setEditingItem(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-stone-300 rounded-[2rem] p-6 shadow-2xl relative w-full max-w-2xl overflow-y-auto max-h-[90vh]"
            >
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="absolute right-6 top-6 p-1.5 hover:bg-stone-100 rounded-full cursor-pointer text-stone-400 hover:text-stone-999 transition-colors"
              >
                <X size={16} />
              </button>

              <div className="mb-6 flex items-center gap-2">
                <Edit3 size={20} className="text-[#f48000]" />
                <h4 className="font-sans text-base font-black text-stone-900 uppercase">Editar Especificações de Produto</h4>
              </div>

              <form onSubmit={submitEditItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-450 block text-left">Nome do Produto</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex: Doce de Cupuaçu"
                      className="w-full px-3 py-2 border border-stone-250 bg-stone-50 rounded-xl text-xs focus:outline-none focus:border-[#f48000]"
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-450 block text-left">Preço Base (Em R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="Ex: 24.90"
                      className="w-full px-3 py-2 border border-stone-250 bg-stone-50 rounded-xl text-xs focus:outline-none focus:border-[#f48000]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category select block */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-450 block text-left">Categoria do Cardápio</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-250 bg-stone-50 rounded-xl text-xs focus:outline-none focus:border-[#f48000] cursor-pointer"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  {/* Image illustration link URL placeholder */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-450 block text-left">URL da Imagem Ilustrativa</label>
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={(e) => setFormImageUrl(e.target.value)}
                      placeholder="Link da imagem..."
                      className="w-full px-3 py-2 border border-stone-250 bg-stone-50 rounded-xl text-xs focus:outline-none focus:border-[#f48000]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-450 block text-left">Descrição Detalhada do Item</label>
                  <textarea
                    required
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Bolas de sorvete, trufa de chocolate, coco ralado..."
                    className="w-full h-16 px-3 py-2 border border-stone-250 bg-stone-50 rounded-xl text-xs focus:outline-none focus:border-[#f48000] resize-none"
                  />
                </div>

                {/* Prep steps config helper lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-450 block text-left">Ingredientes (Separados por vírgula)</label>
                    <input
                      type="text"
                      value={formIngredients}
                      onChange={(e) => setFormIngredients(e.target.value)}
                      placeholder="Morango fresco, calda de avelã..."
                      className="w-full px-3 py-2 border border-stone-250 bg-stone-50 rounded-xl text-xs focus:outline-none focus:border-[#f48000]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-450 block text-left">Etiquetas / Promocionais (Separados por vírgula)</label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="Novo, Vegano, Artesanal..."
                      className="w-full px-3 py-2 border border-stone-250 bg-stone-50 rounded-xl text-xs focus:outline-none focus:border-[#f48000]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-stone-150">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-stone-250"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#f48000] hover:bg-orange-600 border border-orange-550 shadow-3xs text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
