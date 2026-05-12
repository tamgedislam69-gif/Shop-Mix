import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, CartItem, SiteSettings, Order, Media, Post, SiteAnalytics } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS, INITIAL_MEDIA, INITIAL_POSTS } from '../constants';

interface AppContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedColor?: string, selectedSize?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  settings: SiteSettings;
  updateSettings: (newSettings: SiteSettings) => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrderById: (id: string) => Order | undefined;
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  media: Media[];
  setMedia: React.Dispatch<React.SetStateAction<Media[]>>;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  isAdmin: boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  analytics: SiteAnalytics;
  incrementView: (productId: string) => void;
}

const INITIAL_ANALYTICS: SiteAnalytics = {
  visitors: 0,
  productViews: {},
  dailyOrders: {}
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('sm_products');
    return (saved ? JSON.parse(saved) : INITIAL_PRODUCTS).map((p: any) => ({
        ...p,
        views: p.views || 0,
        reviews: Array.isArray(p.reviews) ? p.reviews : []
    }));
  });

  const [analytics, setAnalytics] = useState<SiteAnalytics>(() => {
    const saved = localStorage.getItem('sm_analytics');
    return saved ? JSON.parse(saved) : INITIAL_ANALYTICS;
  });

  useEffect(() => {
    // Basic session-based visitor tracking
    const sessionVisited = sessionStorage.getItem('sm_session_visited');
    if (!sessionVisited) {
        setAnalytics(prev => ({ ...prev, visitors: prev.visitors + 1 }));
        sessionStorage.setItem('sm_session_visited', 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sm_analytics', JSON.stringify(analytics));
  }, [analytics]);

  const incrementView = (productId: string) => {
    setAnalytics(prev => ({
        ...prev,
        productViews: {
            ...prev.productViews,
            [productId]: (prev.productViews[productId] || 0) + 1
        }
    }));
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, views: (p.views || 0) + 1 } : p));
  };

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sm_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('sm_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('sm_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('sm_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [media, setMedia] = useState<Media[]>(() => {
    const saved = localStorage.getItem('sm_media');
    return saved ? JSON.parse(saved) : INITIAL_MEDIA;
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('sm_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('sm_isAdmin') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sm_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sm_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('sm_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('sm_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('sm_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('sm_media', JSON.stringify(media));
  }, [media]);

  useEffect(() => {
    localStorage.setItem('sm_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('sm_isAdmin', isAdmin.toString());
  }, [isAdmin]);

  const addToCart = (product: Product, quantity: number = 1, selectedColor?: string, selectedSize?: string) => {
    setCart(prev => {
      // Calculate variant price modifier
      let priceModifier = 0;
      if (product.variants) {
          const colorVar = product.variants.colors.find(c => c.name === selectedColor);
          const sizeVar = product.variants.sizes.find(s => s.name === selectedSize);
          if (colorVar) priceModifier += colorVar.priceModifier;
          if (sizeVar) priceModifier += sizeVar.priceModifier;
      }
      
      const itemPrice = product.price + priceModifier;
      const itemId = `${product.id}-${selectedColor || ''}-${selectedSize || ''}`;

      const existing = prev.find(item => item.id === itemId);
      if (existing) {
        return prev.map(item => 
          item.id === itemId 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { ...product, id: itemId, price: itemPrice, quantity, name: `${product.name}${selectedColor ? ` (${selectedColor})` : ''}${selectedSize ? ` (${selectedSize})` : ''}` }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const updateSettings = (newSettings: SiteSettings) => setSettings(newSettings);

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    const date = new Date().toISOString().split('T')[0];
    setAnalytics(prev => ({
        ...prev,
        dailyOrders: {
            ...prev.dailyOrders,
            [date]: (prev.dailyOrders[date] || 0) + 1
        }
    }));
  };

  const getOrderById = (id: string) => orders.find(o => o.id === id);

  const addToWishlist = (product: Product) => {
    setWishlist(prev => {
      if (prev.find(p => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist(prev => prev.filter(p => p.id !== productId));
  };

  const isInWishlist = (productId: string) => wishlist.some(p => p.id === productId);

  const login = (email: string, pass: string) => {
    if (email === 'tamgedislam69@gmail.com' && pass === 't112233t') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAdmin(false);

  return (
    <AppContext.Provider value={{
      products, setProducts,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart,
      settings, updateSettings,
      orders, addOrder, getOrderById,
      wishlist, addToWishlist, removeFromWishlist, isInWishlist,
      media, setMedia,
      posts, setPosts,
      isAdmin, login, logout,
      analytics, incrementView
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
