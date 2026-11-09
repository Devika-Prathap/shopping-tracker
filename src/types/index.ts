export type ProductCategory = 
  | 'Clothing' 
  | 'Shoes' 
  | 'Electronics' 
  | 'Beauty' 
  | 'Accessories' 
  | 'Home & Living' 
  | 'Books & Stationery' 
  | 'Food & Groceries' 
  | 'Gaming' 
  | 'Mobile Accessories' 
  | 'Gifts' 
  | 'Other';

export interface PurchaseItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  currentMarketPrice?: number;
  quantity: number;
  category: ProductCategory;
  subCategory: string; // e.g. "Tops", "Sneakers", "Headphones", "Jeans", "Skincare"
  store: string;
  date: string;
  imageUrl?: string;
  color?: string;
  size?: string;
  rating?: number;
  orderStatus: 'Delivered' | 'In Transit' | 'Returned' | 'Cancelled';
  refundAmount?: number;
  isRefunded?: boolean;
  tags?: string[];
  suggestedTags?: string[];
  customDisplayName?: string;
}

export interface FulfillmentOrigin {
  facilityName: string;
  city: string;
  state: string;
  region: 'South' | 'West' | 'North' | 'East' | 'Central';
  hubId: string;
  transitHours?: number;
}

export interface RegionHubData {
  id: string;
  name: string;
  stateOrArea: string;
  region: 'South' | 'West' | 'North' | 'East' | 'Central';
  type: 'Logistics Hub' | 'Flagship Retail' | 'Metro Fulfillment Corridor';
  x: number; // SVG viewBox coordinates (0-800)
  y: number; // SVG viewBox coordinates (0-520)
  associatedStores: string[];
  defaultCategories: ProductCategory[];
  avgDeliveryHours: number;
}

export interface PurchaseTransaction {
  id: string;
  orderNumber: string;
  store: string;
  storeLogo?: string;
  date: string;
  time?: string;
  subtotal: number;
  discount: number;
  deliveryCharges: number;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  source: 'browser_extension' | 'email_receipt' | 'bank_sync' | 'store_webhook';
  items: PurchaseItem[];
  orderStatus: 'Delivered' | 'In Transit' | 'Returned' | 'Cancelled';
  refundAmount?: number;
  isRefunded?: boolean;
  exceededBudgetThreshold?: boolean;
  budgetThresholdRatio?: number;
  rawReceiptSnippet?: string;
  fulfillmentOrigin?: FulfillmentOrigin;
  tags?: string[];
  suggestedTags?: string[];
  isPrivate?: boolean;
  customDisplayName?: string;
  privateCategory?: string;
  hideDetails?: boolean;
}

export interface StoreSummary {
  storeName: string;
  storeLogo?: string;
  totalSpent: number;
  purchaseCount: number;
  productsCount: number;
  averageOrderValue: number;
  mostPurchasedCategory: ProductCategory;
  lastPurchaseDate: string;
  mostExpensivePurchase: { name: string; amount: number };
  colorAccent: string;
  bgPastel: string;
}

export interface AlternativeOption {
  price: number;
  label: string; // e.g. "Similar product", "Similar specifications", "Lower-priced alternative"
  difference: number;
  store?: string;
  brand?: string;
  specs?: string[];
}

export interface CheaperAlternative {
  id: string;
  targetItemId: string;
  targetItemName: string;
  originalPrice: number;
  alternativeName: string;
  alternativePrice: number;
  potentialSaving: number;
  store: string;
  rating: number;
  reviewsCount: number;
  brand: string;
  warranty: string;
  seller: string;
  specComparison: string[];
  type: 'Same product, cheaper seller' | 'Similar product' | 'Lower-priced alternative' | 'Different brand, similar specifications';
  productUrl?: string;
  imageUrl?: string;
  options?: AlternativeOption[];
}

export interface PriceDropItem {
  id: string;
  purchaseId: string;
  productName: string;
  store: string;
  purchasedPrice: number;
  currentPrice: number;
  priceDifference: number;
  purchasedDate: string;
  lastChecked: string;
  imageUrl?: string;
  category: ProductCategory;
  lowestRecordedPrice?: number;
  priceChangedDate?: string;
  maxObservedDifference?: number;
  priceHistory?: { date: string; price: number; note?: string }[];
}

export interface WishlistItem {
  id: string;
  productName: string;
  store: string;
  currentPrice: number;
  targetPrice?: number;
  originalPrice: number;
  detectedDate: string;
  priceHistory: { date: string; price: number }[];
  isWatching: boolean;
  imageUrl?: string;
  category: ProductCategory;
  similarCheaperAvailable?: boolean;
}

export interface CategoryBudget {
  category: ProductCategory;
  monthlyLimit: number;
  color: string;
}

export interface RecurringSubscription {
  id: string;
  name: string;
  merchant: string;
  category: ProductCategory;
  monthlyCost: number;
  billingCycle: 'Monthly' | 'Yearly';
  nextBillingDate: string;
  logo?: string;
  colorAccent: string;
}

export interface BudgetAlertNotification {
  id: string;
  timestamp: string;
  transactionId: string;
  merchant: string;
  purchaseAmount: number;
  remainingBudget: number;
  thresholdAmount: number;
  percentageOfRemaining: number;
  read: boolean;
  message: string;
}

export interface IntegrationStatus {
  id: string;
  name: string;
  type: 'extension' | 'email' | 'payment' | 'store_connector';
  description: string;
  status: 'connected' | 'available' | 'syncing';
  lastPolled: string;
  permissions: string[];
  purchasesDetected: number;
}

export interface SmartCartItem {
  id: string;
  name: string;
  price: number;
  store: string;
  category: ProductCategory;
  imageUrl?: string;
  status: 'good_value' | 'could_be_cheaper' | 'expensive';
  potentialSaving: number;
  statusReason: string;
  cheaperAlternative?: {
    name: string;
    price: number;
    store: string;
    saving: number;
    type: 'Same product, cheaper seller' | 'Similar product' | 'Different brand, similar specs';
    rating: number;
    score: number;
  };
  score: number;
}

export type PersonalityType =
  | 'Fashion Shopper'
  | 'Tech Explorer'
  | 'Deal Hunter'
  | 'Beauty Shopper'
  | 'Home Shopper'
  | 'Gaming Shopper'
  | 'Balanced Shopper';

export interface ShoppingPersonality {
  type: PersonalityType;
  emoji: string;
  title: string;
  description: string;
  traits: {
    dealSensitivity: number;
    brandLoyalty: number;
    techAffinity: number;
    impulseResistance: number;
  };
  keyObservation: string;
  badgeColor: string;
}

export interface SavingStreakData {
  daysWithoutUnnecessary: number;
  daysUnderBudget: number;
  savedThroughAlternatives: number;
  successfulComparisons: number;
  monthlySavingsTotal: number;
  currentStreakBadge: string;
  longestStreak: number;
}

export interface ShoppingChallenge {
  id: string;
  title: string;
  category: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: 'days' | 'rupees' | 'comparisons' | 'items';
  completed: boolean;
  disabled?: boolean;
  rewardBadge: string;
  deadlineDays: number;
}

export interface PersonalSavingGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentSaved: number;
  categoryFocus: ProductCategory;
  monthlyCutbackRecommendation: number;
  monthsToGoal: number;
  projectedMonthsWithCutback: number;
  emoji: string;
}

export interface PriceHistoryProduct {
  id: string;
  productName: string;
  store: string;
  category: ProductCategory;
  currentPrice: number;
  previousPrice: number;
  lowestPrice: number;
  highestPrice: number;
  averagePrice: number;
  isGoodTimeToBuy: boolean;
  advisoryMessage: string;
  history: { date: string; price: number; event?: string }[];
  imageUrl?: string;
}

