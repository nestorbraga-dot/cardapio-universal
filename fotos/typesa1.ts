/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OptionChoice {
  name: string;
  priceModifier: number;
}

export interface MenuOption {
  name: string;
  type: 'single' | 'multiple';
  choices: OptionChoice[];
  required?: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  tags: string[];
  ingredients: string[];
  options?: MenuOption[];
  available: boolean;
  calories?: number;
  prepTime?: string; // e.g. "15-20 min"
}

export interface CartItem {
  cartId: string; // Unique GUID/string distinguishing items with different options
  menuItem: MenuItem;
  quantity: number;
  selectedChoices: { [optionName: string]: OptionChoice[] };
  notes: string;
  unitPriceWithChoices: number;
  totalPrice: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  description: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalPrice: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  customerName: string;
  tableNumber: string;
  paymentMethod: string;
  createdAt: string;
}
