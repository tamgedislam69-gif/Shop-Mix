/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  priceModifier: number;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description: string;
  rating: number;
  reviews: ProductReview[];
  stock: number;
  variants?: {
    colors: ProductVariant[];
    sizes: ProductVariant[];
  };
  views: number;
}

export interface SiteAnalytics {
  visitors: number;
  productViews: { [productId: string]: number };
  dailyOrders: { [date: string]: number };
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ButtonConfig {
  text: string;
  color: string;
  fontSize: string;
  padding: string;
  borderRadius: string;
}

export interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  title: string;
  description: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  status: 'published' | 'draft';
}

export interface SiteSettings {
  primaryColor: string;
  logoText: string;
  heroVideoUrl: string;
  heroText: string;
  heroSubtext: string;
  buyButton: ButtonConfig;
  addToCartButton: ButtonConfig;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customer: {
    name: string;
    phone: string;
    address: string;
    email?: string;
  };
  paymentMethod: 'bkash' | 'nagad' | 'cod';
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}
