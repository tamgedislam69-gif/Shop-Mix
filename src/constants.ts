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
    views: 850
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
    views: 640
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
  {
      id: '5',
      name: "Men's Casual Cotton Shirt",
      price: 1200,
      originalPrice: 1500,
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop',
      category: 'Fashion',
      description: 'Comfortable and breathable 100% cotton shirt. Ideal for summer and casual outings.',
      rating: 4.3,
      reviews: [],
      stock: 25,
      views: 420,
      variants: {
          colors: [
              { id: 'sc1', name: 'Light Blue', priceModifier: 0 },
              { id: 'sc2', name: 'Navy', priceModifier: 0 }
          ],
          sizes: [
              { id: 'ss1', name: 'M', priceModifier: 0 },
              { id: 'ss2', name: 'L', priceModifier: 0 },
              { id: 'ss3', name: 'XL', priceModifier: 50 }
          ]
      }
  },
  {
      id: '6',
      name: 'Professional DSLR Camera Bundle',
      price: 45000,
      originalPrice: 52000,
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop',
      category: 'Electronics',
      description: 'Capture stunning photos and videos with this professional-grade DSLR. Includes 18-55mm lens kit.',
      rating: 4.9,
      reviews: [],
      stock: 5,
      views: 560
  }
];

export const INITIAL_SETTINGS: SiteSettings = {
  primaryColor: '#f85606', // Daraz Orange
  logoText: 'Shop Mix',
  heroVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-shopping-in-a-clothing-store-4348-large.mp4',
  heroText: 'Ultra-Modern Tech Expo 2026',
  heroSubtext: 'Save up to 60% on our latest gadgets and smart home inventory.',
  buyButton: {
    text: 'Buy Now',
    color: '#f85606',
    fontSize: '1rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem'
  },
  addToCartButton: {
    text: 'Add to Cart',
    color: '#2b2b2b',
    fontSize: '1rem',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.375rem'
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

export const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Toys'];
