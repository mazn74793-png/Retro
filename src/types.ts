/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number; // in EGP
  originalPrice?: number; // for discount display
  image: string;
  category: string;
  categoryAr: string;
  sizes: string[]; // M, L, XL, XXL, etc.
  colors: { name: string; nameAr: string; class: string }[];
  inStock: boolean;
  details: string[];
  detailsAr: string[];
  material: string;
  materialAr: string;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: { name: string; nameAr: string; class: string };
  quantity: number;
}

export type OrderStatus = 'placed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface TrackingStep {
  status: OrderStatus;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  timestamp: string;
  completed: boolean;
}

export interface Order {
  id: string; // e.g., RETRO-5928
  customerName: string;
  customerPhone: string;
  city: string;
  cityAr: string;
  address: string;
  items: {
    productId: string;
    productName: string;
    productNameAr: string;
    size: string;
    colorName: string;
    colorNameAr: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  totalAmount: number;
  shippingFee: number;
  paymentMethod: 'vodafone_cash' | 'cod' | 'card';
  paymentDetails?: {
    walletNumber?: string;
    transactionId?: string;
    cardNumber?: string;
  };
  status: OrderStatus;
  trackingHistory: TrackingStep[];
  createdAt: string;
}
