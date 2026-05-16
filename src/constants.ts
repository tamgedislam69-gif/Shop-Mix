import { Product, SiteSettings, Media, Post } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Wireless Noise Cancelling Headphones',
    price: 4500,
    originalPrice: 5500,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop',
    category: 'Electronics',
    description: '<p>Experience pure sound with our flagship wireless headphones.</p><ul><li>Active Noise Cancellation</li><li>40-hour Battery Life</li><li>Premium Comfort Pads</li></ul>',
    rating: 4.8,
    reviews: [],
    stock: 15,
    views: 1240,
    source: 'own',
    isOwnInventory: true,
    variants: {
      colors: [
        { id: 'c1', name: 'Midnight Black', priceModifier: 0 },
        { id: 'c2', name: 'Silver White', priceModifier: 200 }
      ],
      sizes: []
    }
  },
  {
    id: '2',
    name: 'Ultra Slim Smart Watch Pro',
    price: 3200,
    originalPrice: 4000,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop',
    category: 'Electronics',
    description: 'Keep track of your health and stay connected with this elegant smart watch. Features AMOLED display and heart rate monitoring.',
    rating: 4.5,
    reviews: [],
    stock: 20,
    views: 850,
    source: 'alibaba',
    affiliateLink: 'https://www.alibaba.com/product-detail/2024-Ultra-Smart-Watch-Series-9_1601053153678.html'
  },
  {
    id: '3',
    name: 'Premium Leather Crossbody Bag',
    price: 1800,
    originalPrice: 2500,
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop',
    category: 'Fashion',
    description: 'Handcrafted genuine leather bag, perfect for any occasion. Durable, stylish, and spacious.',
    rating: 4.7,
    reviews: [],
    stock: 10,
    views: 640,
    source: 'own',
    isOwnInventory: true
  },
  {
    id: '4',
    name: 'Mechanical Gaming Keyboard RGB',
    price: 2800,
    originalPrice: 3500,
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&auto=format&fit=crop',
    category: 'Electronics',
    description: 'Precision engineering for gamers. Fast response blue switches with customizable RGB lighting.',
    rating: 4.9,
    reviews: [],
    stock: 8,
    views: 2100,
    source: 'own',
    isOwnInventory: true,
    variants: {
      colors: [
        { id: 'k1', name: 'Black', priceModifier: 0 },
        { id: 'k2', name: 'White', priceModifier: 150 }
      ],
      sizes: [
        { id: 's1', name: '60%', priceModifier: -300 },
        { id: 's2', name: '100% Full Size', priceModifier: 0 }
      ]
    }
  },
];

export const INITIAL_SETTINGS: SiteSettings = {
  primaryColor: '#FF6B00', // Reseting to the orange theme from prompt
  logoText: 'Shop Mix',
  heroVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-shopping-in-a-clothing-store-4348-large.mp4',
  heroText: 'Ultra-Modern Tech Expo 2026',
  heroSubtext: 'Save up to 60% on our latest gadgets and smart home inventory.',
  buyButton: {
    text: 'Order Now',
    color: '#FB923C',
    fontSize: '1rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem'
  },
  addToCartButton: {
    text: 'Add to Cart',
    color: '#1F2937',
    fontSize: '1rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem'
  },
  flashSale: {
    isEnabled: true,
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    endMessage: 'Flash Sale Ended!',
    autoRestart: false,
    durationSeconds: 7200
  },
  customization: {
    language: 'bn',
    colors: {
      primary: '#FF6B00',
      secondary: '#1A1A1A',
      accent: '#FF6B00',
      background: '#FDFDFD',
      textMain: '#374151',
      textHeadings: '#111827',
      headerBg: '#FFFFFF',
      headerText: '#111827',
      footerBg: '#111827',
      footerText: '#FFFFFF',
      btnPrimaryBg: '#FF6B00',
      btnSecondaryBg: '#1A1A1A',
      btnText: '#FFFFFF',
      cardBg: '#FFFFFF',
      cardBorder: '#F3F4F6',
      priceColor: '#FF6B00',
      discountBadge: '#EF4444',
      timerBg: '#111827',
      timerText: '#FFFFFF',
      categoryTabBg: '#F3F4F6',
      categoryTabActiveBg: '#FF6B00',
      cartIcon: '#111827',
      whatsappBtn: '#25D366'
    },
    fonts: {
      heading: 'Poppins',
      body: 'Inter',
      button: 'Inter',
      price: 'Inter',
      sizes: {
        heading1: 48,
        heading2: 36,
        heading3: 24,
        body: 16,
        button: 16,
        price: 20,
        menu: 16,
        productTitle: 18
      },
      weights: {
        heading: '900',
        body: '400'
      },
      lineHeight: 1.5,
      letterSpacing: 0
    },
    visibility: {
      heroBanner: true,
      shopCollectionBtn: true,
      learnMoreBtn: true,
      categoryTabs: true,
      flashSaleTimer: true,
      flashSaleSection: true,
      discountBadges: true,
      stockInfo: true,
      starRatings: true,
      wishlistBtn: true,
      shareBtn: true,
      whatsappFloat: true,
      cartFloat: true,
      searchBar: true,
      footer: true,
      newsletter: true,
      socialLinks: true
    },
    layout: {
      productCardSize: 'md',
      imageHeight: 300,
      productSpacing: 24,
      containerPadding: 24,
      borderRadius: 24,
      buttonSize: 'md',
      buttonRadius: 12,
      headerHeight: 80,
      footerHeight: 400,
      gridColumns: 4,
      heroHeight: 600,
      heroPadding: 40,
      cardGap: 24,
      productImageHeight: 300,
      productImageAspectRatio: '1/1',
      productImageFit: 'cover',
    },
    carousel: {
      urls: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1523381235312-3a1b78d97690?w=1600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop'
      ],
      duration: 5,
      isEnabled: true,
    },
    darkMode: false,
    text: {
      websiteName: 'Shop Mix Online',
      heroTitle: 'Premium Shopping Experience',
      shopCollectionBtn: 'Shop Collection',
      learnMoreBtn: 'Learn More',
      flashSaleTitle: 'Flash Sale',
      flashSaleEnded: 'Flash Sale Ended!',
      categories: {
        'All': 'All',
        'Electronics': 'Electronics',
        'Fashion': 'Fashion',
        'Home': 'Home',
        'Beauty': 'Beauty',
        'Toys': 'Toys'
      },
      confirmOrderBtn: 'অর্ডার কনফার্ম করুন'
    },
    productPosting: {
      defaultDescription: '',
      autoAddToCart: false,
      soldOutThreshold: 0
    },
    advanced: {
      customCss: ''
    }
  },
  security: {
    adminEmail: 'tamgedislam69@gmail.com',
    adminPassword: 't112233t'
  }
};

export const INITIAL_MEDIA: Media[] = [
  {
    id: 'm1',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&auto=format&fit=crop',
    type: 'image',
    title: 'Hero Tech Banner',
    description: 'Main homepage slider image for tech items.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'm2',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-shopping-in-a-clothing-store-4348-large.mp4',
    type: 'video',
    title: 'Fashion Promo Video',
    description: 'Background video for premium fashion feel.',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    title: 'Welcoming Shop Mix 2026 Edition',
    content: 'We are thrilled to announce the launch of our new ultra-modern platform. Expect faster deliveries and premium products.',
    author: 'Admin',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'published'
  }
];

export const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Toys'];
