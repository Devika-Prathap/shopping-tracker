import { 
  SmartCartItem, 
  ShoppingPersonality, 
  SavingStreakData, 
  ShoppingChallenge, 
  PersonalSavingGoal, 
  PriceHistoryProduct, 
  PurchaseTransaction,
  ProductCategory
} from '../types';

export const INITIAL_SMART_CART_ITEMS: SmartCartItem[] = [
  {
    id: 'cart-001',
    name: 'Sony WH-1000XM4 Wireless Noise Cancelling Headphones',
    price: 3499,
    store: 'Amazon',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
    status: 'could_be_cheaper',
    potentialSaving: 700,
    statusReason: 'Similar certified audio alternatives with active ANC available on Flipkart & Croma for less.',
    cheaperAlternative: {
      name: 'Sony WH-CH720N Noise Cancelling Wireless Headphones',
      price: 2799,
      store: 'Flipkart',
      saving: 700,
      type: 'Similar product',
      rating: 4.5,
      score: 8.6,
    },
    score: 7.8,
  },
  {
    id: 'cart-002',
    name: 'Nike Revolution 7 Running Shoes (Men)',
    price: 2499,
    store: 'Myntra',
    category: 'Shoes',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
    status: 'could_be_cheaper',
    potentialSaving: 500,
    statusReason: 'Identical colorway listed with instant bank discount on AJIO.',
    cheaperAlternative: {
      name: 'Nike Revolution 7 Road Running (White/Blue)',
      price: 1999,
      store: 'AJIO',
      saving: 500,
      type: 'Same product, cheaper seller',
      rating: 4.6,
      score: 8.8,
    },
    score: 7.5,
  },
  {
    id: 'cart-003',
    name: 'Anker PowerPort III 65W GaN Fast Charger 3-Port',
    price: 899,
    store: 'Amazon',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&auto=format&fit=crop&q=60',
    status: 'good_value',
    potentialSaving: 0,
    statusReason: 'Lowest recorded price in 60 days. Best-in-class multi-device power delivery.',
    score: 9.1,
  },
  {
    id: 'cart-004',
    name: 'Marks & Spencer Pure Cotton Oxford Shirt',
    price: 1899,
    store: 'Tata CLiQ',
    category: 'Clothing',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=60',
    status: 'expensive',
    potentialSaving: 600,
    statusReason: 'Significant markup compared to vetted direct-to-consumer 100% cotton linen shirts.',
    cheaperAlternative: {
      name: 'Snitch Premium Textured Cotton Classic Fit Shirt',
      price: 1299,
      store: 'Myntra',
      saving: 600,
      type: 'Different brand, similar specs',
      rating: 4.4,
      score: 8.4,
    },
    score: 6.9,
  },
];

export const INITIAL_SAVING_STREAK: SavingStreakData = {
  daysWithoutUnnecessary: 7,
  daysUnderBudget: 19,
  savedThroughAlternatives: 1250,
  successfulComparisons: 6,
  monthlySavingsTotal: 3450,
  currentStreakBadge: '🔥 7-Day Smart Streak',
  longestStreak: 14,
};

export const INITIAL_CHALLENGES: ShoppingChallenge[] = [
  {
    id: 'ch-01',
    title: 'No-Spend Challenge',
    category: 'Discretionary',
    description: 'Avoid unnecessary impulse purchases for 7 consecutive days.',
    targetValue: 7,
    currentValue: 7,
    unit: 'days',
    completed: true,
    rewardBadge: '🛡️ Mindful Saver',
    deadlineDays: 0,
  },
  {
    id: 'ch-02',
    title: 'Clothing Cap Challenge',
    category: 'Clothing',
    description: 'Keep your apparel and fashion checkouts under ₹2,000 this month.',
    targetValue: 2000,
    currentValue: 1299,
    unit: 'rupees',
    completed: false,
    rewardBadge: '👗 Capsule Wardrobe',
    deadlineDays: 12,
  },
  {
    id: 'ch-03',
    title: 'Smart Shopper Challenge',
    category: 'Comparisons',
    description: 'Compare prices across at least 2 shopping portals before completing 5 purchases.',
    targetValue: 5,
    currentValue: 4,
    unit: 'comparisons',
    completed: false,
    rewardBadge: '🔍 Deal Master',
    deadlineDays: 8,
  },
  {
    id: 'ch-04',
    title: 'Save ₹1,000 Challenge',
    category: 'Savings',
    description: 'Save at least ₹1,000 using cheaper alternatives, price drops, or coupon stacking.',
    targetValue: 1000,
    currentValue: 1250,
    unit: 'rupees',
    completed: true,
    rewardBadge: '💰 Thrift Champion',
    deadlineDays: 0,
  },
  {
    id: 'ch-05',
    title: '24-Hour Cooling Off',
    category: 'Mindfulness',
    description: 'Delay 3 non-urgent cart additions by 24 hours to prevent spontaneous buying.',
    targetValue: 3,
    currentValue: 2,
    unit: 'items',
    completed: false,
    rewardBadge: '⏳ Patient Buyer',
    deadlineDays: 14,
  },
];

export const INITIAL_SAVING_GOALS: PersonalSavingGoal[] = [
  {
    id: 'goal-01',
    title: 'Emergency Rainy Day Fund',
    targetAmount: 15000,
    currentSaved: 9800,
    categoryFocus: 'Clothing',
    monthlyCutbackRecommendation: 600,
    monthsToGoal: 4,
    projectedMonthsWithCutback: 2,
    emoji: '☔',
  },
  {
    id: 'goal-02',
    title: 'Diwali Festive Tech Upgrade',
    targetAmount: 25000,
    currentSaved: 16500,
    categoryFocus: 'Electronics',
    monthlyCutbackRecommendation: 850,
    monthsToGoal: 5,
    projectedMonthsWithCutback: 3,
    emoji: '✨',
  },
  {
    id: 'goal-03',
    title: 'Weekend Goa Holiday Trip',
    targetAmount: 12000,
    currentSaved: 8400,
    categoryFocus: 'Shoes',
    monthlyCutbackRecommendation: 500,
    monthsToGoal: 3,
    projectedMonthsWithCutback: 1,
    emoji: '🌴',
  },
];

export const INITIAL_PRICE_HISTORY_PRODUCTS: PriceHistoryProduct[] = [
  {
    id: 'ph-001',
    productName: 'Sony WH-1000XM4 Noise Cancelling Wireless Headphones',
    store: 'Amazon',
    category: 'Electronics',
    currentPrice: 3499,
    previousPrice: 3799,
    lowestPrice: 2899,
    highestPrice: 3999,
    averagePrice: 3340,
    isGoodTimeToBuy: false,
    advisoryMessage: '⚠️ Current price (₹3,499) is ₹600 above its 60-day low of ₹2,899. Price drop expected in upcoming festival sale.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
    history: [
      { date: 'May 2026', price: 3999, event: 'Regular retail' },
      { date: 'Jun 2026', price: 3699 },
      { date: 'Jul 2026', price: 2899, event: 'Prime Day Low' },
      { date: 'Aug 2026', price: 3799 },
      { date: 'Sep 2026', price: 3499, event: 'Current' },
    ],
  },
  {
    id: 'ph-002',
    productName: 'Nike Air Max Craft Sneaker (Summit White)',
    store: 'Myntra',
    category: 'Shoes',
    currentPrice: 2499,
    previousPrice: 2999,
    lowestPrice: 2499,
    highestPrice: 3999,
    averagePrice: 3120,
    isGoodTimeToBuy: true,
    advisoryMessage: '🟢 Excellent time to buy! Currently matching the all-time lowest recorded price of ₹2,499.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
    history: [
      { date: 'May 2026', price: 3999 },
      { date: 'Jun 2026', price: 3499 },
      { date: 'Jul 2026', price: 3199 },
      { date: 'Aug 2026', price: 2999 },
      { date: 'Sep 2026', price: 2499, event: 'All-Time Low' },
    ],
  },
  {
    id: 'ph-003',
    productName: 'Nykaa All Day Matte Longwear Liquid Foundation',
    store: 'Nykaa',
    category: 'Beauty',
    currentPrice: 620,
    previousPrice: 650,
    lowestPrice: 499,
    highestPrice: 750,
    averagePrice: 615,
    isGoodTimeToBuy: false,
    advisoryMessage: '⚠️ Steady pricing. Often dips to ₹499 during Nykaa Pink Friday sales.',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=60',
    history: [
      { date: 'May 2026', price: 750 },
      { date: 'Jun 2026', price: 650 },
      { date: 'Jul 2026', price: 499, event: 'Sale' },
      { date: 'Aug 2026', price: 650 },
      { date: 'Sep 2026', price: 620, event: 'Current' },
    ],
  },
];

/**
 * Calculates user's Shopping Personality dynamically based on real purchase history
 */
export function calculateShoppingPersonality(purchases: PurchaseTransaction[]): ShoppingPersonality {
  const delivered = purchases.filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled');
  const items = delivered.flatMap(p => p.items);
  
  const clothingCount = items.filter(it => it.category === 'Clothing').length;
  const shoesCount = items.filter(it => it.category === 'Shoes').length;
  const electronicsCount = items.filter(it => it.category === 'Electronics').length;
  const beautyCount = items.filter(it => it.category === 'Beauty').length;
  const gamingCount = items.filter(it => it.category === 'Gaming').length;

  const totalDiscount = delivered.reduce((sum, p) => sum + (p.discount || 0), 0);
  const totalSpend = delivered.reduce((sum, p) => sum + p.totalAmount, 0);
  const discountRatio = totalSpend > 0 ? (totalDiscount / (totalSpend + totalDiscount)) * 100 : 0;

  // Determine dominant personality
  if (discountRatio > 12) {
    return {
      type: 'Deal Hunter',
      emoji: '💰',
      title: 'Deal Hunter',
      description: 'Most of your purchases come from discounted items, and you frequently compare prices between stores to maximize value.',
      traits: {
        dealSensitivity: 92,
        brandLoyalty: 64,
        techAffinity: 75,
        impulseResistance: 82,
      },
      keyObservation: `You saved ₹${totalDiscount.toLocaleString()} across your checkouts by capturing coupons and promotional sales.`,
      badgeColor: 'from-amber-500 to-yellow-500',
    };
  }

  if (electronicsCount + gamingCount >= items.length * 0.35) {
    return {
      type: 'Tech Explorer',
      emoji: '💻',
      title: 'Tech Explorer',
      description: 'You invest thoughtfully in audio hardware, workspace peripherals, and electronics that elevate daily productivity.',
      traits: {
        dealSensitivity: 78,
        brandLoyalty: 72,
        techAffinity: 95,
        impulseResistance: 70,
      },
      keyObservation: 'Over 38% of your shopping outflow is directed toward personal tech and smart lifestyle gadgets.',
      badgeColor: 'from-blue-500 to-indigo-600',
    };
  }

  if (clothingCount + shoesCount >= items.length * 0.4) {
    return {
      type: 'Fashion Shopper',
      emoji: '👗',
      title: 'Fashion Shopper',
      description: 'Your cart thrives on curated apparel, seasonal wardrobe refreshes, and sneakers from favorite portals like Myntra and AJIO.',
      traits: {
        dealSensitivity: 74,
        brandLoyalty: 88,
        techAffinity: 60,
        impulseResistance: 65,
      },
      keyObservation: 'Apparel and footwear represent your most frequent checkout frequency, averaging a purchase every 4 days.',
      badgeColor: 'from-pink-500 to-rose-600',
    };
  }

  if (beautyCount >= items.length * 0.25) {
    return {
      type: 'Beauty Shopper',
      emoji: '💄',
      title: 'Beauty Shopper',
      description: 'You maintain dedicated self-care rituals, regularly replenishing skincare staples and grooming essentials.',
      traits: {
        dealSensitivity: 70,
        brandLoyalty: 85,
        techAffinity: 55,
        impulseResistance: 76,
      },
      keyObservation: 'Consistent bi-monthly replenishments on trusted beauty portals like Nykaa with strong brand retention.',
      badgeColor: 'from-rose-500 to-pink-500',
    };
  }

  return {
    type: 'Balanced Shopper',
    emoji: '⚖️',
    title: 'Balanced Shopper',
    description: 'You distribute your budget evenly between practical tech utilities, everyday style, and seasonal essentials without excess.',
    traits: {
      dealSensitivity: 80,
      brandLoyalty: 75,
      techAffinity: 75,
      impulseResistance: 85,
    },
    keyObservation: 'Well-proportioned basket distribution across fashion, tech, and wellness hubs with healthy budget pacing.',
    badgeColor: 'from-purple-500 to-indigo-600',
  };
}
