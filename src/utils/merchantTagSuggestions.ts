export type PrimaryTagType = 'Work' | 'Leisure' | 'Essential' | 'Fitness' | 'Personal' | 'Tech Setup' | 'Home';

export interface TagSuggestion {
  id: string;
  label: PrimaryTagType | string;
  reason: string;
  isPrimary?: boolean;
  bgClass: string;
  textClass: string;
  borderClass: string;
  confidence: number;
  confidenceLevel: 'high' | 'medium' | 'fair';
  confidenceReason?: string;
}

/**
 * Visual styling rules for suggested tags
 */
export const TAG_STYLES: Record<string, { bgClass: string; textClass: string; borderClass: string }> = {
  Work: {
    bgClass: 'bg-blue-50 dark:bg-blue-950/60',
    textClass: 'text-blue-700 dark:text-blue-300',
    borderClass: 'border-blue-200 dark:border-blue-800',
  },
  Leisure: {
    bgClass: 'bg-purple-50 dark:bg-purple-950/60',
    textClass: 'text-purple-700 dark:text-purple-300',
    borderClass: 'border-purple-200 dark:border-purple-800',
  },
  Essential: {
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/60',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
  },
  Fitness: {
    bgClass: 'bg-cyan-50 dark:bg-cyan-950/60',
    textClass: 'text-cyan-700 dark:text-cyan-300',
    borderClass: 'border-cyan-200 dark:border-cyan-800',
  },
  Personal: {
    bgClass: 'bg-pink-50 dark:bg-pink-950/60',
    textClass: 'text-pink-700 dark:text-pink-300',
    borderClass: 'border-pink-200 dark:border-pink-800',
  },
  'Tech Setup': {
    bgClass: 'bg-indigo-50 dark:bg-indigo-950/60',
    textClass: 'text-indigo-700 dark:text-indigo-300',
    borderClass: 'border-indigo-200 dark:border-indigo-800',
  },
  Home: {
    bgClass: 'bg-amber-50 dark:bg-amber-950/60',
    textClass: 'text-amber-700 dark:text-amber-300',
    borderClass: 'border-amber-200 dark:border-amber-800',
  },
};

/**
 * Merchant-to-tag suggestion mapping rules
 */
const MERCHANT_RULES: Record<string, { tags: Array<{ label: PrimaryTagType; reason: string }> }> = {
  Amazon: {
    tags: [
      { label: 'Work', reason: 'Amazon is your primary hub for productivity peripherals, office equipment, and audio.' },
      { label: 'Essential', reason: 'Amazon handles routine household necessities and device replacements.' },
    ],
  },
  Croma: {
    tags: [
      { label: 'Work', reason: 'Croma provides office peripherals, multi-device mice, and computing setups.' },
      { label: 'Tech Setup', reason: 'Verified consumer electronics and desktop workstations.' },
    ],
  },
  Myntra: {
    tags: [
      { label: 'Leisure', reason: 'Myntra is used primarily for weekend apparel, casual footwear, and curated fashion.' },
      { label: 'Personal', reason: 'Wardrobe and personal lifestyle choices.' },
    ],
  },
  AJIO: {
    tags: [
      { label: 'Leisure', reason: 'AJIO curates casualwear, linen resort shirts, and weekend apparel.' },
      { label: 'Personal', reason: 'Lifestyle fashion apparel and indie collections.' },
    ],
  },
  Flipkart: {
    tags: [
      { label: 'Essential', reason: 'Flipkart handles utility checkouts, home electronics, and general merchandise.' },
      { label: 'Leisure', reason: 'Entertainment hardware and wireless gaming peripherals.' },
    ],
  },
  Nykaa: {
    tags: [
      { label: 'Essential', reason: 'Daily skincare routines and essential hydration serums.' },
      { label: 'Personal', reason: 'Premium wellness, grooming, and personal care replenishments.' },
    ],
  },
  'Tata CLiQ': {
    tags: [
      { label: 'Work', reason: 'Connected smart wearables and productivity-enhancing timepieces.' },
      { label: 'Fitness', reason: 'Activity tracking hardware and biometric monitoring wearables.' },
    ],
  },
  Blinkit: {
    tags: [
      { label: 'Essential', reason: 'Immediate grocery items and urgent daily necessities.' },
    ],
  },
  Zepto: {
    tags: [
      { label: 'Essential', reason: 'Instant kitchen staples and daily groceries.' },
    ],
  },
  BigBasket: {
    tags: [
      { label: 'Essential', reason: 'Weekly household kitchen essentials and grocery orders.' },
    ],
  },
  Swiggy: {
    tags: [
      { label: 'Leisure', reason: 'Dining, gourmet takeaways, and weekend cravings.' },
      { label: 'Essential', reason: 'Meal planning and quick sustenance.' },
    ],
  },
  Zomato: {
    tags: [
      { label: 'Leisure', reason: 'Restaurant dining, social orders, and leisure meals.' },
    ],
  },
  Decathlon: {
    tags: [
      { label: 'Fitness', reason: 'Athletic wear, workout resistance gear, and outdoor sports.' },
      { label: 'Leisure', reason: 'Active recreational weekends and sports hobbies.' },
    ],
  },
  Nike: {
    tags: [
      { label: 'Fitness', reason: 'High-performance running shoes and athletic footwear.' },
      { label: 'Leisure', reason: 'Streetwear sneaker culture and weekend style.' },
    ],
  },
  Apple: {
    tags: [
      { label: 'Work', reason: 'Professional computing hardware, iPads, and digital work tools.' },
      { label: 'Tech Setup', reason: 'Flagship productivity ecosystem devices.' },
    ],
  },
  Uber: {
    tags: [
      { label: 'Work', reason: 'Office commutes and professional transit.' },
      { label: 'Essential', reason: 'Critical point-to-point urban mobility.' },
    ],
  },
};

/**
 * Returns automated tag suggestions based on the merchant name,
 * with context-aware fallback matching for unrecognized stores.
 */
export function getSuggestedTagsForMerchant(
  merchantName: string,
  itemCategory?: string,
  itemName?: string
): TagSuggestion[] {
  const normalizedMerchant = merchantName ? merchantName.trim() : '';
  const rule = MERCHANT_RULES[normalizedMerchant];
  const lowerCat = itemCategory ? itemCategory.toLowerCase() : '';
  const lowerItem = itemName ? itemName.toLowerCase() : '';

  if (rule && rule.tags.length > 0) {
    return rule.tags.map((t, idx) => {
      const style = TAG_STYLES[t.label] || TAG_STYLES.Essential;

      // Calculate contextual confidence score
      let confidence = idx === 0 ? 95 : 88;
      let boostReason = `Verified merchant profile for '${normalizedMerchant}'.`;

      // Boost confidence if item category or product name directly correlates
      if (
        (t.label === 'Work' && (lowerCat.includes('electronic') || lowerItem.includes('headphone') || lowerItem.includes('mouse') || lowerItem.includes('charger') || lowerItem.includes('watch'))) ||
        (t.label === 'Leisure' && (lowerCat.includes('clothing') || lowerCat.includes('shoe') || lowerItem.includes('sneaker') || lowerItem.includes('shirt') || lowerItem.includes('linen'))) ||
        (t.label === 'Essential' && (lowerCat.includes('food') || lowerCat.includes('grocer') || lowerCat.includes('beauty') || lowerItem.includes('serum') || lowerItem.includes('daily'))) ||
        (t.label === 'Fitness' && (lowerCat.includes('shoe') || lowerItem.includes('running') || lowerItem.includes('sneaker') || lowerItem.includes('smartwatch'))) ||
        (t.label === 'Tech Setup' && (lowerCat.includes('electronic') || lowerItem.includes('charger') || lowerItem.includes('audio') || lowerItem.includes('mouse')))
      ) {
        confidence = Math.min(99, confidence + 4);
        boostReason = `High correlation: '${normalizedMerchant}' catalog aligned with '${itemCategory || 'item metadata'}'.`;
      }

      const confidenceLevel: 'high' | 'medium' | 'fair' = confidence >= 90 ? 'high' : confidence >= 80 ? 'medium' : 'fair';

      return {
        id: `tag-${t.label.toLowerCase()}`,
        label: t.label,
        reason: t.reason,
        isPrimary: idx === 0,
        confidence,
        confidenceLevel,
        confidenceReason: boostReason,
        ...style,
      };
    });
  }

  // Fallback heuristic based on merchant name keywords & category
  const lowerMerchant = normalizedMerchant.toLowerCase();

  const fallbackTags: Array<{ label: PrimaryTagType; reason: string }> = [];

  if (
    lowerMerchant.includes('work') ||
    lowerMerchant.includes('tech') ||
    lowerMerchant.includes('office') ||
    lowerMerchant.includes('croma') ||
    lowerCat.includes('electronics') ||
    lowerItem.includes('keyboard') ||
    lowerItem.includes('mouse') ||
    lowerItem.includes('monitor')
  ) {
    fallbackTags.push({
      label: 'Work',
      reason: `Auto-suggested: '${merchantName}' relates to workplace productivity or electronics.`,
    });
    fallbackTags.push({
      label: 'Tech Setup',
      reason: `Auto-suggested: Computing or hardware peripherals.`,
    });
  } else if (
    lowerMerchant.includes('fashion') ||
    lowerMerchant.includes('cloth') ||
    lowerMerchant.includes('wear') ||
    lowerMerchant.includes('style') ||
    lowerCat.includes('clothing') ||
    lowerCat.includes('shoes')
  ) {
    fallbackTags.push({
      label: 'Leisure',
      reason: `Auto-suggested: '${merchantName}' is a lifestyle and apparel retail portal.`,
    });
    fallbackTags.push({
      label: 'Personal',
      reason: `Personal attire and grooming.`,
    });
  } else if (
    lowerMerchant.includes('fit') ||
    lowerMerchant.includes('gym') ||
    lowerMerchant.includes('sport') ||
    lowerItem.includes('tracker') ||
    lowerItem.includes('sneaker')
  ) {
    fallbackTags.push({
      label: 'Fitness',
      reason: `Auto-suggested: '${merchantName}' specializes in athletic and health activities.`,
    });
    fallbackTags.push({
      label: 'Leisure',
      reason: `Active recreational lifestyle.`,
    });
  } else if (
    lowerMerchant.includes('care') ||
    lowerMerchant.includes('beauty') ||
    lowerMerchant.includes('skin') ||
    lowerCat.includes('beauty')
  ) {
    fallbackTags.push({
      label: 'Essential',
      reason: `Auto-suggested: Routine skincare and personal wellness.`,
    });
    fallbackTags.push({
      label: 'Personal',
      reason: `Self-care and grooming item.`,
    });
  } else {
    fallbackTags.push({
      label: 'Essential',
      reason: `Auto-suggested based on everyday consumer retail merchant profile.`,
    });
    fallbackTags.push({
      label: 'Leisure',
      reason: `Discretionary consumer purchase.`,
    });
  }

  return fallbackTags.map((t, idx) => {
    const style = TAG_STYLES[t.label] || TAG_STYLES.Essential;
    const confidence = idx === 0 ? 84 : 76;
    const confidenceLevel: 'high' | 'medium' | 'fair' = confidence >= 90 ? 'high' : confidence >= 80 ? 'medium' : 'fair';
    return {
      id: `tag-${t.label.toLowerCase()}`,
      label: t.label,
      reason: t.reason,
      isPrimary: idx === 0,
      confidence,
      confidenceLevel,
      confidenceReason: `Inferred classification with ${confidence}% confidence based on merchant pattern heuristics.`,
      ...style,
    };
  });
}
