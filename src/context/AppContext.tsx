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
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
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
  checkoutDrawerOpen: boolean;
  setCheckoutDrawerOpen: (open: boolean) => void;
  selectedProductForCheckout: Product | null;
  setSelectedProductForCheckout: (product: Product | null) => void;
  openCheckout: (product: Product) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
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
    async function fetchOrders() {
      if (isAdmin) {
        try {
          const { db } = await import('../lib/firebase');
          const { collection, onSnapshot, query, orderBy } = await import('firebase/firestore');
          const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
          const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Order[];
            setOrders(data);
          });
          return unsubscribe;
        } catch (error) {
          console.error("Error fetching orders from Firestore:", error);
        }
      }
    }
    let unsub: any;
    fetchOrders().then(u => unsub = u);
    return () => {
      if (unsub && typeof unsub === 'function') unsub();
    };
  }, [isAdmin]);

  const [checkoutDrawerOpen, setCheckoutDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProductForCheckout, setSelectedProductForCheckout] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const openCheckout = (product: Product) => {
    setSelectedProductForCheckout(product);
    setCheckoutDrawerOpen(true);
  };

  useEffect(() => {
    localStorage.setItem('sm_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sm_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('sm_settings', JSON.stringify(settings));
    
    // Apply Customization Settings via CSS Variables
    if (settings.customization) {
      const root = document.documentElement;
      const c = settings.customization;
      
      // Colors
      if (c.colors) {
        root.style.setProperty('--primary-color', c.colors.primary || settings.primaryColor);
        root.style.setProperty('--secondary-color', c.colors.secondary || '#4F46E5');
        root.style.setProperty('--accent-color', c.colors.accent || '#F59E0B');
        root.style.setProperty('--bg-color', c.colors.background || '#FFFFFF');
        root.style.setProperty('--text-main', c.colors.textMain || '#374151');
        root.style.setProperty('--text-headings', c.colors.textHeadings || '#111827');
        root.style.setProperty('--header-bg', c.colors.headerBg || '#FFFFFF');
        root.style.setProperty('--header-text', c.colors.headerText || '#111827');
        root.style.setProperty('--footer-bg', c.colors.footerBg || '#111827');
        root.style.setProperty('--footer-text', c.colors.footerText || '#FFFFFF');
        root.style.setProperty('--btn-primary-bg', c.colors.btnPrimaryBg || settings.primaryColor);
        root.style.setProperty('--btn-secondary-bg', c.colors.btnSecondaryBg || '#4F46E5');
        root.style.setProperty('--btn-text', c.colors.btnText || '#FFFFFF');
        root.style.setProperty('--card-bg', c.colors.cardBg || '#FFFFFF');
        root.style.setProperty('--card-border', c.colors.cardBorder || '#F3F4F6');
        root.style.setProperty('--price-color', c.colors.priceColor || settings.primaryColor);
        root.style.setProperty('--discount-badge', c.colors.discountBadge || '#EF4444');
        root.style.setProperty('--timer-bg', c.colors.timerBg || '#FEF2F2');
        root.style.setProperty('--timer-text', c.colors.timerText || '#EF4444');
        root.style.setProperty('--category-tab-bg', c.colors.categoryTabBg || '#F3F4F6');
        root.style.setProperty('--category-tab-active-bg', c.colors.categoryTabActiveBg || settings.primaryColor);
        root.style.setProperty('--cart-icon-color', c.colors.cartIcon || settings.primaryColor);
        root.style.setProperty('--whatsapp-btn-color', c.colors.whatsappBtn || '#25D366');
      }
      
      // Fonts
      if (c.fonts) {
        root.style.setProperty('--heading-font', c.fonts.heading || 'Inter');
        root.style.setProperty('--body-font', c.fonts.body || 'Inter');
        root.style.setProperty('--btn-font', c.fonts.button || 'Inter');
        root.style.setProperty('--price-font', c.fonts.price || 'Inter');
        
        // Font Sizes
        if (c.fonts.sizes) {
          root.style.setProperty('--h1-size', `${c.fonts.sizes.heading1 || 48}px`);
          root.style.setProperty('--h2-size', `${c.fonts.sizes.heading2 || 36}px`);
          root.style.setProperty('--h3-size', `${c.fonts.sizes.heading3 || 24}px`);
          root.style.setProperty('--body-size', `${c.fonts.sizes.body || 16}px`);
          root.style.setProperty('--btn-size', `${c.fonts.sizes.button || 16}px`);
          root.style.setProperty('--price-size', `${c.fonts.sizes.price || 18}px`);
          root.style.setProperty('--menu-size', `${c.fonts.sizes.menu || 14}px`);
          root.style.setProperty('--product-title-size', `${c.fonts.sizes.productTitle || 16}px`);
        }
        
        // Font Weights
        if (c.fonts.weights) {
          root.style.setProperty('--heading-weight', c.fonts.weights.heading || '900');
          root.style.setProperty('--body-weight', c.fonts.weights.body || '400');
        }

        // Others
        root.style.setProperty('--line-height', c.fonts.lineHeight?.toString() || '1.5');
        root.style.setProperty('--letter-spacing', `${c.fonts.letterSpacing || 0}px`);
      }
      
      // Layout
      if (c.layout) {
        root.style.setProperty('--image-height', `${c.layout.imageHeight || 300}px`);
        root.style.setProperty('--product-spacing', `${c.layout.productSpacing || 24}px`);
        root.style.setProperty('--container-padding', `${c.layout.containerPadding || 16}px`);
        root.style.setProperty('--border-radius', `${c.layout.borderRadius || 16}px`);
        root.style.setProperty('--btn-radius', `${c.layout.buttonRadius || 12}px`);
        root.style.setProperty('--header-height', `${c.layout.headerHeight || 80}px`);
        root.style.setProperty('--footer-height', `${c.layout.footerHeight || 400}px`);
        root.style.setProperty('--grid-cols', (c.layout.gridColumns || 4).toString());
        root.style.setProperty('--hero-padding', `${c.layout.heroPadding || 40}px`);
        root.style.setProperty('--card-gap', `${c.layout.cardGap || 24}px`);
        root.style.setProperty('--grid-gap', `${c.layout.cardGap || 24}px`);
        root.style.setProperty('--prod-img-height', `${c.layout.productImageHeight || 300}px`);
        root.style.setProperty('--img-container-height', `${c.layout.productImageHeight || 300}px`);
        root.style.setProperty('--prod-img-aspect-ratio', c.layout.productImageAspectRatio || '1/1');
        root.style.setProperty('--prod-img-fit', c.layout.productImageFit || 'cover');
      }

      // Dark Mode & Theme Colors
      if (c.darkMode) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }

      const colors = c.colors || {};
      root.style.setProperty('--bg-color', colors.background || (c.darkMode ? '#111827' : '#FFFFFF'));
      root.style.setProperty('--text-main', colors.textMain || (c.darkMode ? '#F3F4F6' : '#333333'));
      root.style.setProperty('--text-headings', colors.textHeadings || (c.darkMode ? '#FFFFFF' : '#111111'));
      root.style.setProperty('--card-bg', colors.cardBg || (c.darkMode ? '#1F2937' : '#FFFFFF'));
      root.style.setProperty('--card-border', colors.cardBorder || (c.darkMode ? '#374151' : '#EEEEEE'));
      root.style.setProperty('--header-bg', colors.headerBg || (c.darkMode ? '#111111' : '#FFFFFF'));
      root.style.setProperty('--header-text', colors.headerText || (c.darkMode ? '#FFFFFF' : '#111111'));
      
      if (c.fonts) {
        root.style.setProperty('--heading-font', c.fonts.heading || 'Poppins');
        root.style.setProperty('--body-font', c.fonts.body || 'Inter');
      }

      // Custom HTML Injection
      const existingContainer = document.getElementById('custom-site-html');
      if (existingContainer) existingContainer.remove();
      
      if (c.advanced?.customHtml) {
        const container = document.createElement('div');
        container.id = 'custom-site-html';
        container.innerHTML = c.advanced.customHtml;
        document.body.appendChild(container);
        
        // Handle scripts inside custom HTML
        const scripts = container.getElementsByTagName('script');
        Array.from(scripts).forEach(oldScript => {
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
          newScript.appendChild(document.createTextNode(oldScript.innerHTML));
          oldScript.parentNode?.replaceChild(newScript, oldScript);
        });
      }

      // Custom CSS
      let styleTag = document.getElementById('custom-site-css');
      if (c.advanced?.customCss) {
        if (!styleTag) {
          styleTag = document.createElement('style');
          styleTag.id = 'custom-site-css';
          document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = c.advanced.customCss;
      } else if (styleTag) {
        styleTag.remove();
      }
    }
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
    const adminEmail = settings.security?.adminEmail || 'tamgedislam69@gmail.com';
    const adminPass = settings.security?.adminPassword || 't112233t';
    
    if (email === adminEmail && pass === adminPass) {
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
      orders, setOrders, addOrder, getOrderById,
      wishlist, addToWishlist, removeFromWishlist, isInWishlist,
      media, setMedia,
      posts, setPosts,
      isAdmin, login, logout,
      analytics, incrementView,
      checkoutDrawerOpen, setCheckoutDrawerOpen,
      isSettingsOpen, setIsSettingsOpen,
      isMenuOpen, setIsMenuOpen,
      selectedProductForCheckout, setSelectedProductForCheckout,
      searchQuery, setSearchQuery,
      openCheckout
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
