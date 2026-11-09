import { RegionHubData, FulfillmentOrigin, PurchaseTransaction, ProductCategory } from '../types';

export const GEOGRAPHIC_HUBS: RegionHubData[] = [
  {
    id: 'hub-blr',
    name: 'Bengaluru Tech & Fashion Corridor',
    stateOrArea: 'Karnataka (Hosur & Whitefield)',
    region: 'South',
    type: 'Metro Fulfillment Corridor',
    x: 350,
    y: 380,
    associatedStores: ['Myntra', 'Flipkart', 'Nike', 'Apple'],
    defaultCategories: ['Clothing', 'Shoes', 'Electronics'],
    avgDeliveryHours: 24,
  },
  {
    id: 'hub-bom',
    name: 'Mumbai MMR & Bhiwandi Logistics Zone',
    stateOrArea: 'Maharashtra (Bhiwandi & BKC)',
    region: 'West',
    type: 'Logistics Hub',
    x: 230,
    y: 280,
    associatedStores: ['Amazon', 'Nykaa', 'AJIO', 'Apple'],
    defaultCategories: ['Electronics', 'Beauty', 'Clothing'],
    avgDeliveryHours: 28,
  },
  {
    id: 'hub-del',
    name: 'Delhi NCR & Gurugram Retail Hub',
    stateOrArea: 'National Capital Region (Gurugram & Noida)',
    region: 'North',
    type: 'Metro Fulfillment Corridor',
    x: 320,
    y: 130,
    associatedStores: ['Amazon', 'Flipkart', 'Zara', 'Nykaa'],
    defaultCategories: ['Clothing', 'Electronics', 'Home & Living'],
    avgDeliveryHours: 26,
  },
  {
    id: 'hub-hyd',
    name: 'Hyderabad Deccan Fulfillment Cluster',
    stateOrArea: 'Telangana (Shamshabad & HITEC City)',
    region: 'South',
    type: 'Logistics Hub',
    x: 390,
    y: 300,
    associatedStores: ['Amazon', 'Flipkart', 'AJIO'],
    defaultCategories: ['Electronics', 'Clothing', 'Accessories'],
    avgDeliveryHours: 32,
  },
  {
    id: 'hub-maa',
    name: 'Chennai Coromandel Commerce Zone',
    stateOrArea: 'Tamil Nadu (Sriperumbudur & OMR)',
    region: 'South',
    type: 'Logistics Hub',
    x: 430,
    y: 410,
    associatedStores: ['Amazon', 'Myntra', 'Nike'],
    defaultCategories: ['Shoes', 'Clothing', 'Electronics'],
    avgDeliveryHours: 36,
  },
  {
    id: 'hub-pnq',
    name: 'Pune Industrial & Retail Gateway',
    stateOrArea: 'Maharashtra (Chakan & Viman Nagar)',
    region: 'West',
    type: 'Flagship Retail',
    x: 260,
    y: 310,
    associatedStores: ['Zara', 'Nike', 'AJIO', 'Tata CLiQ'],
    defaultCategories: ['Clothing', 'Shoes', 'Accessories'],
    avgDeliveryHours: 30,
  },
  {
    id: 'hub-ccu',
    name: 'Kolkata Eastern Logistics Gateway',
    stateOrArea: 'West Bengal (Dankuni & Salt Lake)',
    region: 'East',
    type: 'Logistics Hub',
    x: 580,
    y: 230,
    associatedStores: ['Flipkart', 'Amazon', 'Nykaa'],
    defaultCategories: ['Beauty', 'Books & Stationery', 'Clothing'],
    avgDeliveryHours: 42,
  },
  {
    id: 'hub-amd',
    name: 'Ahmedabad West Logistics Corridor',
    stateOrArea: 'Gujarat (Sanand & Changodar)',
    region: 'West',
    type: 'Logistics Hub',
    x: 200,
    y: 220,
    associatedStores: ['AJIO', 'Amazon', 'Flipkart'],
    defaultCategories: ['Clothing', 'Home & Living'],
    avgDeliveryHours: 34,
  },
];

export interface HubDetailedMetric {
  hub: RegionHubData;
  totalSpent: number;
  orderCount: number;
  itemCount: number;
  stores: string[];
  categories: Record<string, number>;
  transactions: PurchaseTransaction[];
  percentageOfTotal: number;
  intensityRatio: number; // 0 to 1
  topCategory: { name: string; amount: number; percentage: number };
  fastestStore: string;
}

/**
 * Extracts or deterministically matches a purchase transaction to its origin fulfillment hub
 */
export function extractFulfillmentData(tx: PurchaseTransaction, fallbackIndex: number = 0): FulfillmentOrigin {
  if (tx.fulfillmentOrigin) {
    return tx.fulfillmentOrigin;
  }

  // Find candidate hubs supporting this store
  const candidates = GEOGRAPHIC_HUBS.filter(h => h.associatedStores.includes(tx.store));
  const targetHub = candidates.length > 0 
    ? candidates[fallbackIndex % candidates.length] 
    : GEOGRAPHIC_HUBS[fallbackIndex % GEOGRAPHIC_HUBS.length];

  return {
    hubId: targetHub.id,
    facilityName: `${targetHub.name} Facility #FC-${targetHub.id.slice(4).toUpperCase()}`,
    city: targetHub.stateOrArea.split('(')[0].trim(),
    state: targetHub.stateOrArea,
    region: targetHub.region,
    transitHours: targetHub.avgDeliveryHours,
  };
}

/**
 * Aggregates all purchase history into structured geographic hub metrics
 */
export function aggregateGeographicMetrics(
  purchases: PurchaseTransaction[],
  filterStore: string = 'ALL',
  filterCategory: string = 'ALL',
  filterRegion: string = 'ALL'
): {
  hubs: HubDetailedMetric[];
  totalRegionalSpend: number;
  totalOrdersCount: number;
  maxHubSpend: number;
  topHub: HubDetailedMetric | null;
  fastestHub: RegionHubData;
} {
  const delivered = purchases.filter(p => !p.isRefunded && p.orderStatus !== 'Cancelled');

  const rawMap: Record<
    string,
    {
      totalSpent: number;
      orderCount: number;
      itemCount: number;
      stores: Set<string>;
      categories: Record<string, number>;
      transactions: PurchaseTransaction[];
    }
  > = {};

  GEOGRAPHIC_HUBS.forEach(h => {
    rawMap[h.id] = {
      totalSpent: 0,
      orderCount: 0,
      itemCount: 0,
      stores: new Set(),
      categories: {},
      transactions: [],
    };
  });

  delivered.forEach((tx, idx) => {
    if (filterStore !== 'ALL' && tx.store !== filterStore) return;

    const matchingItems = filterCategory === 'ALL'
      ? tx.items
      : tx.items.filter(i => i.category === filterCategory);

    if (matchingItems.length === 0) return;

    const itemsTotal = matchingItems.reduce((sum, it) => sum + (it.price * (it.quantity || 1)), 0);
    const origin = extractFulfillmentData(tx, idx);
    const targetHubId = origin.hubId || 'hub-blr';

    if (rawMap[targetHubId]) {
      rawMap[targetHubId].totalSpent += itemsTotal;
      rawMap[targetHubId].orderCount += 1;
      rawMap[targetHubId].itemCount += matchingItems.length;
      rawMap[targetHubId].stores.add(tx.store);
      rawMap[targetHubId].transactions.push(tx);

      matchingItems.forEach(it => {
        rawMap[targetHubId].categories[it.category] = 
          (rawMap[targetHubId].categories[it.category] || 0) + (it.price * (it.quantity || 1));
      });
    }
  });

  const totalRegionalSpend = Object.values(rawMap).reduce((s, m) => s + m.totalSpent, 0);
  const totalOrdersCount = Object.values(rawMap).reduce((s, m) => s + m.orderCount, 0);
  const maxHubSpend = Math.max(1, ...Object.values(rawMap).map(m => m.totalSpent));

  let results: HubDetailedMetric[] = GEOGRAPHIC_HUBS.map(hub => {
    const raw = rawMap[hub.id] || {
      totalSpent: 0,
      orderCount: 0,
      itemCount: 0,
      stores: new Set<string>(),
      categories: {},
      transactions: [],
    };

    const sortedCats = Object.entries(raw.categories).sort((a, b) => b[1] - a[1]);
    const topCatName = sortedCats[0]?.[0] || hub.defaultCategories[0] || 'General';
    const topCatAmt = sortedCats[0]?.[1] || 0;
    const topCatPct = raw.totalSpent > 0 ? Math.round((topCatAmt / raw.totalSpent) * 100) : 0;

    return {
      hub,
      totalSpent: raw.totalSpent,
      orderCount: raw.orderCount,
      itemCount: raw.itemCount,
      stores: Array.from(raw.stores),
      categories: raw.categories,
      transactions: raw.transactions,
      percentageOfTotal: totalRegionalSpend > 0 ? Math.round((raw.totalSpent / totalRegionalSpend) * 100) : 0,
      intensityRatio: maxHubSpend > 0 ? raw.totalSpent / maxHubSpend : 0,
      topCategory: {
        name: topCatName,
        amount: topCatAmt,
        percentage: topCatPct,
      },
      fastestStore: Array.from(raw.stores)[0] || hub.associatedStores[0],
    };
  });

  // Filter by region if requested
  if (filterRegion !== 'ALL') {
    results = results.filter(r => r.hub.region === filterRegion);
  }

  // Sort by total spent descending
  results.sort((a, b) => b.totalSpent - a.totalSpent);

  const topHub = results.length > 0 && results[0].totalSpent > 0 ? results[0] : results[0] || null;

  const fastestHub = [...GEOGRAPHIC_HUBS].sort((a, b) => a.avgDeliveryHours - b.avgDeliveryHours)[0];

  return {
    hubs: results,
    totalRegionalSpend,
    totalOrdersCount,
    maxHubSpend,
    topHub,
    fastestHub,
  };
}
