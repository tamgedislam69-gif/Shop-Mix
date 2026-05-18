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
  hex?: string;
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  showImage?: boolean;
  gallery?: string[];
  category: string;
  description: string;
  rating: number;
  reviews: ProductReview[];
  stock: number;
  videoUrl?: string;
  showVideo?: boolean;
  source: 'alibaba' | 'own';
  variants?: {
    colors: ProductVariant[];
    sizes: ProductVariant[];
  };
  views: number;
  affiliateLink?: string;
  isOwnInventory?: boolean;
  enableSizes?: boolean;
  enableColors?: boolean;
}

export interface Division {
  id: string;
  name: string;
  bnName: string;
}

export interface District {
  id: string;
  divisionId: string;
  name: string;
  bnName: string;
}

export interface SiteAnalytics {
  visitors: number;
  productViews: { [productId: string]: number };
  dailyOrders: { [date: string]: number };
}

export interface CartItem extends Product {
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
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

export interface CustomizationSettings {
  language: 'bn' | 'en' | 'mixed';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    textMain: string;
    textHeadings: string;
    headerBg: string;
    headerText: string;
    footerBg: string;
    footerText: string;
    btnPrimaryBg: string;
    btnSecondaryBg: string;
    btnText: string;
    cardBg: string;
    cardBorder: string;
    priceColor: string;
    discountBadge: string;
    timerBg: string;
    timerText: string;
    categoryTabBg: string;
    categoryTabActiveBg: string;
    cartIcon: string;
    whatsappBtn: string;
  };
  fonts: {
    heading: string;
    body: string;
    button: string;
    price: string;
    sizes: {
      heading1: number;
      heading2: number;
      heading3: number;
      body: number;
      button: number;
      price: number;
      menu: number;
      productTitle: number;
    };
    weights: {
      heading: string;
      body: string;
    };
    lineHeight: number;
    letterSpacing: number;
  };
  visibility: {
    heroBanner: boolean;
    shopCollectionBtn: boolean;
    learnMoreBtn: boolean;
    categoryTabs: boolean;
    flashSaleTimer: boolean;
    flashSaleSection: boolean;
    discountBadges: boolean;
    stockInfo: boolean;
    starRatings: boolean;
    wishlistBtn: boolean;
    shareBtn: boolean;
    whatsappFloat: boolean;
    cartFloat: boolean;
    searchBar: boolean;
    footer: boolean;
    newsletter: boolean;
    socialLinks: boolean;
  };
  layout: {
    productCardSize: 'sm' | 'md' | 'lg';
    imageHeight: number;
    productSpacing: number;
    containerPadding: number;
    borderRadius: number;
    buttonSize: 'sm' | 'md' | 'lg';
    buttonRadius: number;
    headerHeight: number;
    footerHeight: number;
    gridColumns: number;
    heroHeight: number;
    heroPadding: number;
    cardGap: number;
    productImageHeight: number;
    productImageAspectRatio: string;
    productImageFit: 'cover' | 'contain';
  };
  carousel?: {
    urls: string[];
    slidesConfig?: {
      title?: string;
      subtitle?: string;
      titleColor?: string;
      subtitleColor?: string;
      position?: { x: number; y: number };
      animation?: 'fade' | 'slideUp' | 'zoomIn';
    }[];
    duration: number;
    isEnabled: boolean;
    height?: number;
    hideOverlay?: boolean;
  };
  darkMode?: boolean;
  text: {
    websiteName: string;
    heroTitle: string;
    shopCollectionBtn: string;
    learnMoreBtn: string;
    flashSaleTitle: string;
    flashSaleEnded: string;
    categories: { [key: string]: string };
    confirmOrderBtn: string;
  };
  productPosting?: {
    defaultDescription: string;
    autoAddToCart: boolean;
    soldOutThreshold: number;
  };
  advanced?: {
    customCss: string;
    customHtml: string;
  };
  theme?: 'default' | 'luxury-dark' | 'minimal-white' | 'festive';
}

export interface SiteSettings {
  primaryColor: string;
  logoText: string;
  heroVideoUrl: string;
  heroText: string;
  heroSubtext: string;
  buyButton: ButtonConfig;
  addToCartButton: ButtonConfig;
  companyInfo?: {
    phone: string;
    email: string;
    address: string;
    facebookProfile: string;
    facebookPage: string;
    instagram: string;
    whatsapp: string;
    imo: string;
  };
  flashSale?: {
    isEnabled: boolean;
    startTime: string;
    endTime: string;
    endMessage: string;
    autoRestart?: boolean;
    durationSeconds?: number;
  };
  customization?: CustomizationSettings;
  security?: {
    adminEmail: string;
    adminPassword?: string;
  };
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
