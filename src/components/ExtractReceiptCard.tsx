import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Camera, 
  Sparkles, 
  Check, 
  CheckCircle2, 
  RotateCw, 
  Upload, 
  Store, 
  Calendar, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Tag, 
  FileText, 
  Receipt,
  Scan,
  RefreshCw,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  Info,
  AlertTriangle,
  HelpCircle,
  Edit2,
  SlidersHorizontal,
  X,
  AlertCircle,
  Sun,
  Eye,
  CornerDownRight,
  Maximize2,
  GitMerge,
  Layers,
  Search,
  Link2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, ProductCategory, PurchaseItem } from '../types';

interface ExtractReceiptCardProps {
  purchases?: PurchaseTransaction[];
  onAddPurchase?: (purchase: PurchaseTransaction) => void;
  onUpdatePurchase?: (purchase: PurchaseTransaction) => void;
  onNavigateTab?: (tab: any) => void;
}

// Preset physical receipts for easy 1-click simulation
interface PresetReceipt {
  id: string;
  merchant: string;
  rawOcrMerchant?: string; // What raw OCR initially extracted
  storeCategory: ProductCategory;
  date: string;
  totalAmount: number;
  tax: number;
  paymentMethod: string;
  orderNumber: string;
  items: {
    name: string;
    price: number;
    quantity: number;
    category: ProductCategory;
    subCategory?: string;
  }[];
  notes: string;
  accentColor: string;
  defaultSimulateLowConfidence?: boolean;
  lowConfidenceReason?: string;
  isExtractionFailure?: boolean;
  failureReason?: string;
  isMatchCandidate?: boolean;
  matchingOrderNumber?: string;
}

const PRESET_PHYSICAL_RECEIPTS: PresetReceipt[] = [
  {
    id: 'rec-myntra-match-01',
    merchant: 'Myntra',
    rawOcrMerchant: 'Myntra Retail Hub',
    storeCategory: 'Shoes',
    date: '2026-09-30',
    totalAmount: 2999,
    tax: 270,
    paymentMethod: 'UPI (GPay · HDFC Bank)',
    orderNumber: 'MYN-SLIP-99824',
    items: [
      { name: 'Nike Air Max Craft Sneaker (UK 8)', price: 2999, quantity: 1, category: 'Shoes', subCategory: 'Sneakers' },
    ],
    notes: 'Matches Order #MYN-9982410 (Sep 30 · ₹2,999) · Auto-Merge Candidate',
    accentColor: '#8b5cf6',
    defaultSimulateLowConfidence: false,
    isMatchCandidate: true,
    matchingOrderNumber: 'MYN-9982410',
  },
  {
    id: 'rec-amazon-match-02',
    merchant: 'Amazon',
    rawOcrMerchant: 'Amazon Retail India',
    storeCategory: 'Electronics',
    date: '2026-09-29', // Within 1 day of 2026-09-28
    totalAmount: 3499,
    tax: 315,
    paymentMethod: 'Credit Card (HDFC)',
    orderNumber: 'AMZ-REC-40299',
    items: [
      { name: 'Sony Wireless ANC Headphones', price: 3499, quantity: 1, category: 'Electronics', subCategory: 'Headphones' },
    ],
    notes: 'Matches Order #AMZ-402-9918231 (Sep 28 · ₹3,499) · Auto-Merge Candidate',
    accentColor: '#3b82f6',
    defaultSimulateLowConfidence: false,
    isMatchCandidate: true,
    matchingOrderNumber: 'AMZ-402-9918231',
  },
  {
    id: 'rec-fail-glare-00',
    merchant: 'Zara Lifestyle',
    rawOcrMerchant: '??? [HEADER NOT DETECTED]',
    storeCategory: 'Clothing',
    date: '2026-10-23',
    totalAmount: 3490,
    tax: 314,
    paymentMethod: 'Apple Pay (HDFC Visa)',
    orderNumber: 'ZAR-FAIL-990',
    items: [
      { name: 'Oversized Wool Blend Trench Coat', price: 2790, quantity: 1, category: 'Clothing', subCategory: 'Jackets' },
      { name: 'Ribbed Knit Wool Scarf', price: 700, quantity: 1, category: 'Clothing', subCategory: 'Accessories' },
    ],
    notes: 'Header Cut Off & Direct Light Glare · Fails First Capture',
    accentColor: '#ef4444',
    isExtractionFailure: true,
    failureReason: 'Merchant name header is cut off and unreadable; overhead light glare obscured the total amount.',
  },
  {
    id: 'rec-zara-01',
    merchant: 'Zara Lifestyle',
    rawOcrMerchant: 'Zara Lifestyle',
    storeCategory: 'Clothing',
    date: '2026-10-23',
    totalAmount: 3490,
    tax: 314,
    paymentMethod: 'Apple Pay (HDFC Visa)',
    orderNumber: 'ZAR-REC-88410',
    items: [
      { name: 'Oversized Wool Blend Trench Coat', price: 2790, quantity: 1, category: 'Clothing', subCategory: 'Jackets' },
      { name: 'Ribbed Knit Wool Scarf', price: 700, quantity: 1, category: 'Clothing', subCategory: 'Accessories' },
    ],
    notes: 'Clear Capture · Forum South Bengaluru',
    accentColor: '#ec4899',
    defaultSimulateLowConfidence: false,
  },
  {
    id: 'rec-apple-02',
    merchant: 'Apple Store (Imagine)',
    rawOcrMerchant: 'Apple Store (Imagine)',
    storeCategory: 'Electronics',
    date: '2026-10-22',
    totalAmount: 4900,
    tax: 747,
    paymentMethod: 'UPI (GPay · ICICI)',
    orderNumber: 'APL-INV-99214',
    items: [
      { name: 'MagSafe Dual Wireless Fast Charger Pad', price: 3900, quantity: 1, category: 'Electronics', subCategory: 'Chargers' },
      { name: 'Silicone Case with MagSafe (Midnight)', price: 1000, quantity: 1, category: 'Electronics', subCategory: 'Accessories' },
    ],
    notes: 'UB City Flagship · Register 02',
    accentColor: '#8b5cf6',
    defaultSimulateLowConfidence: false,
  },
  {
    id: 'rec-crinkled-low-03',
    merchant: 'Z@RA? St0re (Unclear OCR)',
    rawOcrMerchant: 'Z@RA? St0re (Unclear OCR)',
    storeCategory: 'Clothing',
    date: '2026-10-23',
    totalAmount: 3490,
    tax: 314,
    paymentMethod: 'Card / UPI',
    orderNumber: 'ZAR-OCR-NOISY',
    items: [
      { name: 'Apparel Item (Wool Blend)', price: 2790, quantity: 1, category: 'Clothing', subCategory: 'Jackets' },
      { name: 'Accessory Item', price: 700, quantity: 1, category: 'Clothing', subCategory: 'Accessories' },
    ],
    notes: 'Thermal Paper Crinkled · 58% OCR Match',
    accentColor: '#f59e0b',
    defaultSimulateLowConfidence: true,
    lowConfidenceReason: "Merchant name contains OCR symbol noise ('Z@RA? St0re'). Suggested match: 'Zara Lifestyle'.",
  },
  {
    id: 'rec-unknown-low-04',
    merchant: 'Corner Bodega #49',
    rawOcrMerchant: 'Corner Bodega #49',
    storeCategory: 'Food & Groceries',
    date: '2026-10-23',
    totalAmount: 18500,
    tax: 1665,
    paymentMethod: 'Cash / UPI',
    orderNumber: 'BDG-SLIP-9901',
    items: [
      { name: 'Assorted Pantry Provisions', price: 18500, quantity: 1, category: 'Food & Groceries', subCategory: 'Groceries' },
    ],
    notes: 'Handwritten / Faded Ink · 54% Confidence',
    accentColor: '#f97316',
    defaultSimulateLowConfidence: true,
    lowConfidenceReason: "Merchant not found in known stores directory, and total amount (₹18,500) exceeds typical grocery order range.",
  },
  {
    id: 'rec-sbux-05',
    merchant: 'Starbucks Coffee',
    rawOcrMerchant: 'Starbucks Coffee',
    storeCategory: 'Food & Groceries',
    date: '2026-10-23',
    totalAmount: 785,
    tax: 70,
    paymentMethod: 'Starbucks Card / UPI',
    orderNumber: 'SBUX-REC-33120',
    items: [
      { name: 'Vanilla Sweet Cream Cold Brew (Venti)', price: 395, quantity: 1, category: 'Food & Groceries', subCategory: 'Beverages' },
      { name: 'Butter Croissant & Almond Biscotti', price: 390, quantity: 1, category: 'Food & Groceries', subCategory: 'Bakery' },
    ],
    notes: 'Koramangala 5th Block · Order #42',
    accentColor: '#10b981',
    defaultSimulateLowConfidence: false,
  },
];

type ScanningStage = 'idle' | 'snapping' | 'detecting' | 'ocr' | 'validating' | 'searching' | 'completed' | 'failed';

interface AutomatedValidationReport {
  confidenceScore: number; // 0 - 100
  isLowConfidence: boolean;
  merchantStatus: 'verified_known' | 'fuzzy_matched' | 'unrecognized';
  merchantSuggestion?: string;
  amountStatus: 'valid' | 'suspicious_high' | 'suspicious_zero';
  dateStatus: 'valid' | 'suspicious';
  validationFlags: string[];
}

export const ExtractReceiptCard: React.FC<ExtractReceiptCardProps> = ({
  purchases = [],
  onAddPurchase,
  onUpdatePurchase,
  onNavigateTab,
}) => {
  const { formatPrice, currency } = useApp();

  // Known merchants list derived from user's actual purchases and established stores
  const knownMerchants = useMemo(() => {
    const defaultStores = [
      'Amazon', 
      'Myntra', 
      'Flipkart', 
      'AJIO', 
      'Nykaa', 
      'Croma Electronics', 
      'Tata CLiQ', 
      'Swiggy Instamart', 
      'Zara Lifestyle', 
      'Apple Store (Imagine)', 
      'Starbucks Coffee', 
      'H&M'
    ];
    const userStores = purchases.map(p => p.store);
    return Array.from(new Set([...defaultStores, ...userStores]));
  }, [purchases]);

  // Selected sample receipt for simulation
  const [selectedReceipt, setSelectedReceipt] = useState<PresetReceipt>(PRESET_PHYSICAL_RECEIPTS[0]);
  
  // Scanning state machine
  const [scanningStage, setScanningStage] = useState<ScanningStage>('idle');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [hasAddedSuccess, setHasAddedSuccess] = useState<boolean>(false);
  const [lastAddedTx, setLastAddedTx] = useState<PurchaseTransaction | null>(null);

  // Auto-Merge State for matched transactions
  const [hasMergedSuccess, setHasMergedSuccess] = useState<boolean>(false);
  const [mergedTransaction, setMergedTransaction] = useState<PurchaseTransaction | null>(null);

  // Guided Retry Mechanism State
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isGuidedAlignmentActive, setIsGuidedAlignmentActive] = useState<boolean>(false);
  const [recoverySuccessMessage, setRecoverySuccessMessage] = useState<string | null>(null);
  const [hasAttemptedCapture, setHasAttemptedCapture] = useState<boolean>(false);

  // Editable parsed fields state (for user corrections / low-confidence confirmation)
  const [editableMerchant, setEditableMerchant] = useState<string>(selectedReceipt.rawOcrMerchant || selectedReceipt.merchant);
  const [editableAmount, setEditableAmount] = useState<number>(selectedReceipt.totalAmount);
  const [editableDate, setEditableDate] = useState<string>(selectedReceipt.date);
  const [isUserConfirmed, setIsUserConfirmed] = useState<boolean>(false);

  // Toggle to manually simulate low confidence on any receipt
  const [forceLowConfidenceSimulation, setForceLowConfidenceSimulation] = useState<boolean>(
    selectedReceipt.defaultSimulateLowConfidence || false
  );

  // Sync editable fields when selected receipt changes
  useEffect(() => {
    setEditableMerchant(selectedReceipt.rawOcrMerchant || selectedReceipt.merchant);
    setEditableAmount(selectedReceipt.totalAmount);
    setEditableDate(selectedReceipt.date);
    setIsUserConfirmed(false);
    setForceLowConfidenceSimulation(selectedReceipt.defaultSimulateLowConfidence || false);
    setScanningStage('idle');
    setScanProgress(0);
    setHasAddedSuccess(false);
    setHasMergedSuccess(false);
    setMergedTransaction(null);
    setRetryCount(0);
    setIsGuidedAlignmentActive(false);
    setRecoverySuccessMessage(null);
    setHasAttemptedCapture(false);
  }, [selectedReceipt]);

  // Search Transactions Step: finds existing transaction matching exact amount, date within ±2 days, and similar store
  const matchedTransaction = useMemo<PurchaseTransaction | null>(() => {
    if (!editableAmount || !editableDate || !editableMerchant || purchases.length === 0) {
      return null;
    }
    const cleanMerchant = editableMerchant.trim().toLowerCase();
    const cleanExtractedDate = new Date(editableDate).getTime();
    if (isNaN(cleanExtractedDate)) return null;

    return purchases.find(p => {
      // 1. Exact amount match (tolerance < 1 for float/currency rounding)
      if (Math.abs(p.totalAmount - editableAmount) >= 1) return false;

      // 2. Date match: within two days (<= 2 * 24 * 60 * 60 * 1000)
      const pDate = new Date(p.date).getTime();
      if (isNaN(pDate)) return false;
      const diffDays = Math.abs(pDate - cleanExtractedDate) / (1000 * 60 * 60 * 24);
      if (diffDays > 2.05) return false;

      // 3. Similar store match (contains or known alias)
      const pStore = p.store.trim().toLowerCase();
      const isStoreMatch = 
        pStore.includes(cleanMerchant) ||
        cleanMerchant.includes(pStore) ||
        (cleanMerchant.includes('myntra') && pStore.includes('myntra')) ||
        (cleanMerchant.includes('amazon') && pStore.includes('amazon')) ||
        (cleanMerchant.includes('zara') && pStore.includes('zara')) ||
        (cleanMerchant.includes('apple') && pStore.includes('apple')) ||
        (cleanMerchant.includes('starbucks') && pStore.includes('starbucks')) ||
        (cleanMerchant.includes('croma') && pStore.includes('croma'));

      return isStoreMatch;
    }) || null;
  }, [editableAmount, editableDate, editableMerchant, purchases]);

  // Automated Validation Step: evaluates merchant match, amount pattern & calculates confidence score
  const validationReport = useMemo<AutomatedValidationReport>(() => {
    const flags: string[] = [];
    let score = 0;

    // 1. Merchant Validation Check
    const cleanMerchant = editableMerchant.trim().toLowerCase();
    
    // Check for exact match against known merchants
    const exactMatch = knownMerchants.find(m => m.toLowerCase() === cleanMerchant);
    
    // Check for fuzzy / substring match
    const fuzzyMatch = knownMerchants.find(m => {
      const lower = m.toLowerCase();
      return (
        cleanMerchant.includes(lower) || 
        lower.includes(cleanMerchant) ||
        (cleanMerchant.includes('zara') && lower.includes('zara')) ||
        (cleanMerchant.includes('apple') && lower.includes('apple')) ||
        (cleanMerchant.includes('croma') && lower.includes('croma')) ||
        (cleanMerchant.includes('starbucks') && lower.includes('starbucks'))
      );
    });

    let merchantStatus: 'verified_known' | 'fuzzy_matched' | 'unrecognized' = 'unrecognized';
    let merchantSuggestion: string | undefined = undefined;

    if (exactMatch) {
      merchantStatus = 'verified_known';
      score += 40;
    } else if (fuzzyMatch) {
      merchantStatus = 'fuzzy_matched';
      merchantSuggestion = fuzzyMatch;
      score += 24;
      flags.push(`Extracted merchant '${editableMerchant}' is noisy or partial; matches known merchant '${fuzzyMatch}'.`);
    } else {
      merchantStatus = 'unrecognized';
      score += 10;
      flags.push(`Merchant '${editableMerchant}' is not recognized in your known store directory.`);
    }

    // Check for OCR noise symbols (e.g. @, ?, #, 0 instead of O)
    if (/[@?$%^*]/.test(editableMerchant) || /st0re/i.test(editableMerchant)) {
      score -= 10;
      if (!flags.some(f => f.includes('OCR noise'))) {
        flags.push('Merchant name contains OCR artifact characters (@, ?, 0).');
      }
    }

    // 2. Amount Pattern Check
    let amountStatus: 'valid' | 'suspicious_high' | 'suspicious_zero' = 'valid';
    if (!editableAmount || editableAmount <= 0 || isNaN(editableAmount)) {
      amountStatus = 'suspicious_zero';
      score += 0;
      flags.push('Extracted amount is missing or invalid.');
    } else if (editableAmount > 15000 && selectedReceipt.storeCategory !== 'Electronics') {
      amountStatus = 'suspicious_high';
      score += 18;
      flags.push(`Amount (${formatPrice(editableAmount)}) is unusually high for non-electronic retail.`);
    } else {
      amountStatus = 'valid';
      score += 40;
    }

    // 3. Date Pattern Check
    let dateStatus: 'valid' | 'suspicious' = 'valid';
    if (/^\d{4}-\d{2}-\d{2}$/.test(editableDate)) {
      dateStatus = 'valid';
      score += 20;
    } else {
      dateStatus = 'suspicious';
      score += 5;
      flags.push('Date format does not match expected YYYY-MM-DD pattern.');
    }

    // If user explicitly enabled low-confidence simulation or selected low-confidence preset
    if (forceLowConfidenceSimulation && !isUserConfirmed) {
      score = Math.min(score, 58);
      if (selectedReceipt.lowConfidenceReason && !flags.includes(selectedReceipt.lowConfidenceReason)) {
        flags.unshift(selectedReceipt.lowConfidenceReason);
      }
    }

    // If user has explicitly verified & confirmed the details, elevate score to 100%
    if (isUserConfirmed) {
      score = 100;
    }

    const finalScore = Math.min(100, Math.max(20, score));
    const isLowConfidence = finalScore < 80 && !isUserConfirmed;

    return {
      confidenceScore: finalScore,
      isLowConfidence,
      merchantStatus,
      merchantSuggestion,
      amountStatus,
      dateStatus,
      validationFlags: flags,
    };
  }, [editableMerchant, editableAmount, editableDate, knownMerchants, isUserConfirmed, forceLowConfidenceSimulation, selectedReceipt, formatPrice]);

  // Custom user image upload
  const [customImage, setCustomImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Trigger the mock AI extraction process with automated validation, transaction search, and failure/retry detection
  const handleSnapPhoto = () => {
    setFlashActive(true);
    setScanningStage('snapping');
    setScanProgress(12);
    setHasAddedSuccess(false);
    setHasMergedSuccess(false);
    setMergedTransaction(null);
    setIsUserConfirmed(false);
    setRecoverySuccessMessage(null);
    setHasAttemptedCapture(true);

    setTimeout(() => {
      setFlashActive(false);
      setScanningStage('detecting');
      setScanProgress(30);
    }, 400);

    setTimeout(() => {
      setScanningStage('ocr');
      setScanProgress(50);
    }, 850);

    // If receipt scenario is set to fail extraction AND user hasn't completed a guided retry yet
    if (selectedReceipt.isExtractionFailure && retryCount === 0) {
      setTimeout(() => {
        setScanningStage('failed');
        setScanProgress(60);
        setIsGuidedAlignmentActive(true);
      }, 1300);
      return;
    }

    // Step 4: Automated Validation against known stores directory
    setTimeout(() => {
      setScanningStage('validating');
      setScanProgress(70);
    }, 1350);

    // Step 5: Search Transactions step in purchase history for matching amount & date
    setTimeout(() => {
      setScanningStage('searching');
      setScanProgress(88);
    }, 1850);

    // Step 6: Completed and ready for user action
    setTimeout(() => {
      setScanningStage('completed');
      setScanProgress(100);

      // If this was a successful recovery after a retry attempt
      if (selectedReceipt.isExtractionFailure && retryCount > 0) {
        setEditableMerchant('Zara Lifestyle');
        setRecoverySuccessMessage(
          "Recapture Successful! By aligning the merchant header and eliminating glare, Merchant ('Zara Lifestyle') and Total ('₹3,490') were recovered with 96% confidence."
        );
      }
    }, 2450);
  };

  // User clicks "Retry Capture with Guided Alignment"
  const handleRetryWithGuidance = () => {
    setRetryCount(prev => prev + 1);
    setIsGuidedAlignmentActive(true);
    handleSnapPhoto();
  };

  // User accepts a suggested known merchant
  const handleApplySuggestion = (suggestion: string) => {
    setEditableMerchant(suggestion);
    setIsUserConfirmed(true);
  };

  // User confirms the low-confidence receipt details
  const handleUserConfirmDetails = () => {
    setIsUserConfirmed(true);
  };

  // Auto-merge receipt image and details with existing transaction in history
  const handleMergeWithExisting = () => {
    if (!matchedTransaction || !onUpdatePurchase) return;

    const receipt = selectedReceipt;
    const finalMerchant = editableMerchant.trim() || matchedTransaction.store;
    const finalAmount = Number(editableAmount) || matchedTransaction.totalAmount;
    const scanDateFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const mergedTx: PurchaseTransaction = {
      ...matchedTransaction,
      rawReceiptSnippet: `Physical Receipt Merged: ${finalMerchant} Slip #${receipt.orderNumber} (Scanned ${scanDateFormatted}) - OCR Conf: ${validationReport.confidenceScore}% · Amount Verified: ${formatPrice(finalAmount)}`,
      tags: Array.from(new Set([
        ...(matchedTransaction.tags || []),
        'Physical Receipt Attached',
        'Verified Receipt Image',
        'Auto-Merged'
      ])),
    };

    onUpdatePurchase(mergedTx);
    setMergedTransaction(mergedTx);
    setHasMergedSuccess(true);
  };

  // Auto-populate and add as a separate/new PurchaseTransaction
  const handleConfirmAddTransaction = () => {
    if (!onAddPurchase) return;

    const receipt = selectedReceipt;
    const finalMerchant = editableMerchant.trim();
    const finalAmount = Number(editableAmount) || receipt.totalAmount;
    const finalDate = editableDate || receipt.date;

    const newItems: PurchaseItem[] = receipt.items.map((it, idx) => ({
      id: `extracted-item-${Date.now()}-${idx}`,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      category: it.category,
      subCategory: it.subCategory || 'General',
      store: finalMerchant,
      date: finalDate,
      orderStatus: 'Delivered',
      tags: ['Receipt Photo Scan', finalMerchant, 'Verified OCR'],
    }));

    const newTransaction: PurchaseTransaction = {
      id: `tx-receipt-${Date.now()}`,
      orderNumber: receipt.orderNumber,
      store: finalMerchant,
      date: finalDate,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      subtotal: finalAmount,
      discount: 0,
      deliveryCharges: 0,
      totalAmount: finalAmount,
      currency: currency || '₹',
      paymentMethod: receipt.paymentMethod,
      source: 'browser_extension',
      items: newItems,
      orderStatus: 'Delivered',
      rawReceiptSnippet: `Physical Receipt Scan: ${finalMerchant} (OCR Conf: ${validationReport.confidenceScore}%) - Total: ${formatPrice(finalAmount)}`,
      tags: ['Physical Receipt', 'Mock AI OCR', finalMerchant],
    };

    onAddPurchase(newTransaction);
    setLastAddedTx(newTransaction);
    setHasAddedSuccess(true);
  };

  // Reset scanner
  const handleReset = () => {
    setScanningStage('idle');
    setScanProgress(0);
    setHasAddedSuccess(false);
    setHasMergedSuccess(false);
    setMergedTransaction(null);
    setIsUserConfirmed(false);
    setRetryCount(0);
    setIsGuidedAlignmentActive(false);
    setRecoverySuccessMessage(null);
    setHasAttemptedCapture(false);
    setEditableMerchant(selectedReceipt.rawOcrMerchant || selectedReceipt.merchant);
    setEditableAmount(selectedReceipt.totalAmount);
    setEditableDate(selectedReceipt.date);
  };

  // Handle custom image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCustomImage(reader.result as string);
      handleSnapPhoto();
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 min-w-0 box-border">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Extract Receipt</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">· Search Matches, Auto-Merge & Guided Recovery</span>
          </div>

          <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Physical Receipt Scanner & Transaction Auto-Merge
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 max-w-xl">
            Simulate snapping a receipt photo. AI extracts merchant, date, and amount, searches purchase history for matching orders to auto-merge, and provides guided feedback if recapture is needed.
          </p>
        </div>

        {/* Preset Selector with Failure Simulation Tag */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Scenario:</span>
          <select
            value={selectedReceipt.id}
            onChange={(e) => {
              const found = PRESET_PHYSICAL_RECEIPTS.find(r => r.id === e.target.value);
              if (found) {
                setSelectedReceipt(found);
              }
            }}
            disabled={scanningStage !== 'idle' && scanningStage !== 'completed' && scanningStage !== 'failed'}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer disabled:opacity-50"
          >
            {PRESET_PHYSICAL_RECEIPTS.map(r => (
              <option key={r.id} value={r.id}>
                {r.merchant} {r.isMatchCandidate ? '(Auto-Merge Match 🔗)' : r.isExtractionFailure ? '(Simulate Failure ❌)' : r.defaultSimulateLowConfidence ? '(Low Conf ⚠️)' : '(High Conf ✅)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Interactive Grid: Left Viewfinder (Simulated Camera), Right Parser, Telemetry & Guided Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-w-0">
        {/* LEFT COLUMN: Simulated Camera Viewfinder with Guided Target Zones (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between min-w-0">
          <div className="relative w-full rounded-2xl bg-slate-950 text-white overflow-hidden shadow-inner border border-slate-800 min-h-[380px] flex flex-col justify-between p-4">
            {/* Camera Shutter Flash Overlay */}
            {flashActive && (
              <div className="absolute inset-0 bg-white z-50 animate-ping opacity-90 pointer-events-none" />
            )}

            {/* Top Viewfinder HUD */}
            <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 font-mono text-[11px]">
                <span className={`w-2 h-2 rounded-full ${
                  scanningStage === 'failed' 
                    ? 'bg-rose-500 animate-pulse' 
                    : isGuidedAlignmentActive 
                      ? 'bg-purple-400 animate-pulse' 
                      : 'bg-emerald-400 animate-pulse'
                }`} />
                <span>
                  {scanningStage === 'failed' 
                    ? 'FRAME DEFECT DETECTED' 
                    : isGuidedAlignmentActive 
                      ? 'GUIDED ALIGNMENT ACTIVE' 
                      : 'AI VISION READY'}
                </span>
              </div>
              
              <div className="text-[11px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
                {retryCount > 0 ? `RETRY ATTEMPT #${retryCount}` : '1080p · AUTO-FOCUS'}
              </div>
            </div>

            {/* Central Viewfinder Bounding Box with Corner Framing Brackets & Guided Target Zones */}
            <div className={`relative z-10 my-auto mx-auto w-full max-w-xs sm:max-w-sm aspect-[3/4] border-2 rounded-xl p-3 flex flex-col justify-between backdrop-blur-xs transition-all ${
              scanningStage === 'failed'
                ? 'border-rose-500/80 bg-rose-950/20'
                : isGuidedAlignmentActive
                  ? 'border-purple-400 bg-purple-950/20 shadow-lg shadow-purple-500/20'
                  : 'border-dashed border-purple-400/40 bg-slate-900/60'
            }`}>
              {/* 4 Glowing Corner Target Brackets */}
              <div className={`absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 ${
                scanningStage === 'failed' ? 'border-rose-500' : 'border-purple-400'
              }`} />
              <div className={`absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 ${
                scanningStage === 'failed' ? 'border-rose-500' : 'border-purple-400'
              }`} />
              <div className={`absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 ${
                scanningStage === 'failed' ? 'border-rose-500' : 'border-purple-400'
              }`} />
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 ${
                scanningStage === 'failed' ? 'border-rose-500' : 'border-purple-400'
              }`} />

              {/* Guided Overlay Zone 1: Merchant Header Target Area (Top) */}
              {(isGuidedAlignmentActive || scanningStage === 'failed') && (
                <div className="absolute top-2 left-2 right-2 border border-dashed border-amber-400 bg-amber-500/15 rounded-lg p-1.5 text-center text-[10px] font-bold text-amber-300 z-30 pointer-events-none animate-pulse flex items-center justify-center gap-1.5">
                  <Store className="w-3 h-3 text-amber-400" />
                  <span>ENSURE MERCHANT NAME IS VISIBLE HERE</span>
                </div>
              )}

              {/* Laser Scanning Animation Bar (Sweeps during scanning) */}
              {(scanningStage === 'detecting' || scanningStage === 'ocr' || scanningStage === 'validating') && (
                <div 
                  className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-lg shadow-purple-500/80 z-20 animate-pulse"
                  style={{
                    top: `${scanProgress}%`,
                    transition: 'top 0.4s ease-in-out',
                  }}
                />
              )}

              {/* Physical Receipt Paper Mockup Preview */}
              <div className={`w-full h-full bg-[#fdfbf7] text-slate-800 rounded-lg p-3 font-mono text-[11px] shadow-md flex flex-col justify-between relative overflow-hidden select-none transition-all ${
                selectedReceipt.isExtractionFailure && retryCount === 0
                  ? 'brightness-90 contrast-75'
                  : ''
              }`}>
                {/* Simulated glare hotspot if in failure scenario before retry */}
                {selectedReceipt.isExtractionFailure && retryCount === 0 && (
                  <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/70 rounded-full blur-xl pointer-events-none" />
                )}

                {/* Perforated Top Edge Effect */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-repeat-x bg-[radial-gradient(circle,_transparent_2px,_#fdfbf7_2px)]" />

                {/* Receipt Header */}
                <div className="text-center border-b border-dashed border-slate-300 pb-2">
                  <div className={`font-extrabold text-sm tracking-tight truncate ${
                    selectedReceipt.isExtractionFailure && retryCount === 0
                      ? 'text-slate-400 blur-xs'
                      : 'text-slate-900'
                  }`}>
                    {selectedReceipt.isExtractionFailure && retryCount === 0
                      ? '*** [HEADER CUT OFF / GLARE] ***'
                      : `*** ${(editableMerchant || selectedReceipt.merchant).toUpperCase()} ***`}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    {selectedReceipt.notes}
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-500 mt-1">
                    <span>DATE: {editableDate}</span>
                    <span>SLIP: #{selectedReceipt.orderNumber.substring(0, 8)}</span>
                  </div>
                </div>

                {/* Itemized Lines */}
                <div className="py-2 space-y-1.5 flex-1">
                  {selectedReceipt.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-start text-[10px]">
                      <span className="line-clamp-1 pr-1 font-medium">{item.name}</span>
                      <span className="shrink-0 font-bold">{formatPrice(item.price)}</span>
                    </div>
                  ))}
                </div>

                {/* Receipt Total */}
                <div className="border-t-2 border-slate-800 pt-1.5 space-y-0.5">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>GST / TAX:</span>
                    <span>{formatPrice(selectedReceipt.tax)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-extrabold text-slate-900">
                    <span>TOTAL AMOUNT:</span>
                    <span className="text-purple-700">{formatPrice(editableAmount)}</span>
                  </div>
                  <div className="text-[9px] text-slate-400 text-center pt-1">
                    THANK YOU FOR SHOPPING!
                  </div>
                </div>
              </div>

              {/* Guided Overlay Zone 2: Total Amount & Date Target Area (Bottom) */}
              {(isGuidedAlignmentActive || scanningStage === 'failed') && (
                <div className="absolute bottom-2 left-2 right-2 border border-dashed border-purple-400 bg-purple-500/15 rounded-lg p-1 text-center text-[10px] font-bold text-purple-300 z-30 pointer-events-none animate-pulse flex items-center justify-center gap-1.5">
                  <Tag className="w-3 h-3 text-purple-400" />
                  <span>TOTAL SUM & DATE MUST BE INSIDE FRAME</span>
                </div>
              )}
            </div>

            {/* Bottom Camera Shutter Controls Bar */}
            <div className="relative z-10 pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
              {/* Preset Quick Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-[200px] sm:max-w-xs">
                {PRESET_PHYSICAL_RECEIPTS.slice(0, 4).map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedReceipt(r);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedReceipt.id === r.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-slate-300'
                    }`}
                  >
                    {r.merchant.split(' ')[0]} {r.isExtractionFailure ? '❌' : r.defaultSimulateLowConfidence ? '⚠️' : '✅'}
                  </button>
                ))}
              </div>

              {/* Shutter Button (Simulate Snap Photo) */}
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload receipt photo from file"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                </button>

                {scanningStage === 'failed' ? (
                  <button
                    type="button"
                    onClick={handleRetryWithGuidance}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-500/30 active:scale-95 transition-all cursor-pointer"
                  >
                    <RotateCw className="w-4 h-4 animate-spin-once" />
                    <span>Retry Capture</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSnapPhoto}
                    disabled={scanningStage !== 'idle' && scanningStage !== 'completed'}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-purple-500/30 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{hasAttemptedCapture ? 'Retake Photo' : 'Snap Photo'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Mock AI Parsing Telemetry, Guided Feedback & Auto-Populate (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4 min-w-0">
          {/* Status & Automated Validation Telemetry Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI OCR & Pattern Validator</span>
              </span>

              {/* Status Badge */}
              {scanningStage === 'failed' ? (
                <div className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Extraction Failed · Retry Required</span>
                </div>
              ) : scanningStage === 'completed' ? (
                <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 ${
                  validationReport.isLowConfidence
                    ? 'bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200'
                    : 'bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                }`}>
                  {validationReport.isLowConfidence ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>{validationReport.confidenceScore}% Confidence</span>
                </div>
              ) : null}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  scanningStage === 'failed'
                    ? 'bg-rose-500'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                }`}
                style={{ width: `${scanProgress}%` }}
              />
            </div>

            {/* Stepper Status Descriptions */}
            <div className="grid grid-cols-6 gap-1 text-center text-[10px] font-medium pt-1">
              <div className={`${scanProgress >= 12 ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-400'}`}>
                1. Snap
              </div>
              <div className={`${scanProgress >= 30 ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-400'}`}>
                2. Edges
              </div>
              <div className={`${scanProgress >= 50 ? (scanningStage === 'failed' ? 'text-rose-600 font-bold' : 'text-purple-600 dark:text-purple-400 font-bold') : 'text-slate-400'}`}>
                3. OCR
              </div>
              <div className={`${scanProgress >= 70 ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-400'}`}>
                4. Validate
              </div>
              <div className={`${scanProgress >= 88 ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-400'}`}>
                5. Search
              </div>
              <div className={`${scanProgress >= 100 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-400'}`}>
                6. Ready
              </div>
            </div>

            {/* Active Telemetry Message */}
            <div className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
              {scanningStage === 'idle' && (
                <>
                  <Info className="w-4 h-4 text-purple-500 shrink-0" />
                  <span>Click <strong>Snap Photo</strong> to simulate camera shutter and run automated merchant/amount extraction.</span>
                </>
              )}
              {scanningStage === 'snapping' && (
                <>
                  <Zap className="w-4 h-4 text-amber-500 shrink-0 animate-bounce" />
                  <span>Capturing optical receipt frame into memory...</span>
                </>
              )}
              {scanningStage === 'detecting' && (
                <>
                  <Scan className="w-4 h-4 text-purple-500 shrink-0 animate-spin" />
                  <span>Aligning receipt bounding corners and perspective deskew...</span>
                </>
              )}
              {scanningStage === 'ocr' && (
                <>
                  <RefreshCw className="w-4 h-4 text-indigo-500 shrink-0 animate-spin" />
                  <span>Extracting alphanumeric strings, totals, and line items...</span>
                </>
              )}
              {scanningStage === 'validating' && (
                <>
                  <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0 animate-pulse" />
                  <span>Automated validation: checking merchant against known stores directory...</span>
                </>
              )}
              {scanningStage === 'searching' && (
                <span className="text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 font-medium">
                  <Search className="w-4 h-4 shrink-0 animate-spin text-indigo-500" />
                  <span>Searching purchase history for existing transactions ({formatPrice(editableAmount)} within ±2 days)...</span>
                </span>
              )}
              {scanningStage === 'failed' && (
                <span className="text-rose-700 dark:text-rose-300 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>Extraction failed: Merchant name is not detected and glare obscured the total amount. See guided feedback below to retry.</span>
                </span>
              )}
              {scanningStage === 'completed' && (
                <>
                  {matchedTransaction ? (
                    <span className="text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 font-medium">
                      <GitMerge className="w-4 h-4 shrink-0 text-indigo-500" />
                      <span>Existing transaction match detected! Order #{matchedTransaction.orderNumber} ({matchedTransaction.store}) found in purchase history.</span>
                    </span>
                  ) : validationReport.isLowConfidence ? (
                    <span className="text-amber-700 dark:text-amber-300 flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                      <span>Low detection confidence ({validationReport.confidenceScore}%). Please review and confirm extracted merchant and amount.</span>
                    </span>
                  ) : (
                    <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                      <span>Validation passed! Merchant recognized and amount pattern verified with high confidence.</span>
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* GUIDED RETRY ASSISTANT (Shows when extraction fails) */}
          {scanningStage === 'failed' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/90 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 shadow-sm space-y-3 animate-fadeIn">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-200 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-300" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-rose-950 dark:text-rose-200">
                      Extraction Failed · Guided Recovery Feedback
                    </h4>
                    <p className="text-[11px] text-rose-700 dark:text-rose-300">
                      The automated parser could not detect required fields. Follow these steps to improve image capture:
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200 shrink-0">
                  Attempt {retryCount + 1} of 3
                </span>
              </div>

              {/* 4 Actionable Guided Feedback Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                {/* Tip 1: Merchant visibility */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                    <Store className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Ensure merchant name is visible</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    Position the top header and store logo within the upper alignment target zone. Avoid clipping the store name.
                  </p>
                </div>

                {/* Tip 2: Glare & Reflections */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                    <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Eliminate overhead glare</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    Thermal receipt paper reflects bright light. Angle your phone 10° away from lights and turn off camera flash.
                  </p>
                </div>

                {/* Tip 3: Flatten paper folds */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                    <Maximize2 className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span>Flatten creases & align edges</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    Smooth out paper folds against a dark surface so line items and the total sum stay flat and horizontal.
                  </p>
                </div>

                {/* Tip 4: Framing checklist */}
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Fit all 4 corners in frame</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    Keep the entire receipt body inside the corner framing brackets to ensure the date and subtotal are parsed.
                  </p>
                </div>
              </div>

              {/* Primary Guided Retry Action Bar */}
              <div className="pt-2 flex items-center justify-between gap-2 flex-wrap">
                <div className="text-[11px] text-rose-800 dark:text-rose-300 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>Guided target zones enabled on viewfinder</span>
                </div>

                <button
                  onClick={handleRetryWithGuidance}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retry Capture with Guided Alignment</span>
                </button>
              </div>
            </div>
          )}

          {/* SUCCESSFUL RETRY RECOVERY BANNER */}
          {recoverySuccessMessage && scanningStage === 'completed' && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/80 shadow-xs flex items-start gap-3 animate-fadeIn">
              <div className="w-7 h-7 rounded-lg bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
                  Guided Recapture Successful!
                </h4>
                <p className="text-emerald-800 dark:text-emerald-300 mt-0.5 leading-relaxed">
                  {recoverySuccessMessage}
                </p>
              </div>
            </div>
          )}

          {/* LOW-CONFIDENCE PROMPT BANNER (Alerts user when detection confidence is low) */}
          {scanningStage === 'completed' && validationReport.isLowConfidence && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 shadow-xs space-y-2.5 animate-fadeIn">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-200 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
                      User Confirmation Required (Confidence: {validationReport.confidenceScore}%)
                    </h4>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300">
                      Automated validation detected potential OCR noise or an unrecognized merchant pattern.
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 shrink-0">
                  Needs Review
                </span>
              </div>

              {/* Specific validation flags */}
              <ul className="text-xs text-amber-800 dark:text-amber-300/90 space-y-1 list-disc pl-5">
                {validationReport.validationFlags.map((flag, idx) => (
                  <li key={idx} className="leading-snug">{flag}</li>
                ))}
              </ul>

              {/* 1-Click Known Merchant Suggestion Button (if fuzzy match found) */}
              {validationReport.merchantSuggestion && (
                <div className="pt-1 flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-[11px] font-medium text-amber-900 dark:text-amber-200">
                    Did you mean:
                  </span>
                  <button
                    onClick={() => handleApplySuggestion(validationReport.merchantSuggestion!)}
                    className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 dark:bg-amber-800/80 dark:hover:bg-amber-700 text-amber-900 dark:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply "{validationReport.merchantSuggestion}"</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SUCCESSFUL MERGE CONFIRMATION BANNER */}
          {hasMergedSuccess && mergedTransaction && (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/80 shadow-sm space-y-3 animate-fadeIn">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5 flex-wrap">
                      <span>Receipt Image Auto-Merged!</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                        Order #{mergedTransaction.orderNumber}
                      </span>
                    </h4>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                      Successfully attached scanned receipt image and OCR snippet to existing <strong>{mergedTransaction.store}</strong> purchase of <strong>{formatPrice(mergedTransaction.totalAmount)}</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-slate-400">
                  <span>METADATA SNIPPET ATTACHED:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">STATUS: VERIFIED & MERGED</span>
                </div>
                <p className="font-mono text-emerald-900 dark:text-emerald-200 leading-snug">
                  {mergedTransaction.rawReceiptSnippet}
                </p>
                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Updated Tags:</span>
                  {mergedTransaction.tags?.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Scan Another Receipt</span>
                </button>

                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('purchases')}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View in Purchases List</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* MATCHING TRANSACTION COMPARISON PROMPT CARD */}
          {scanningStage === 'completed' && matchedTransaction && !hasMergedSuccess && !hasAddedSuccess && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/95 via-purple-50/70 to-slate-50 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-slate-900 border-2 border-indigo-400 dark:border-indigo-700 shadow-md space-y-3.5 animate-fadeIn">
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 border-b border-indigo-200/80 dark:border-indigo-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/30">
                    <GitMerge className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-extrabold text-indigo-950 dark:text-indigo-100">
                        Matching Transaction Detected
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700">
                        Search Step Match
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">
                      Found an existing transaction with matching amount, date within ±2 days, and store name. Would you like to merge this receipt image into the existing order, or keep it as a separate record?
                    </p>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Comparison Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. Existing Transaction in History */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/80 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Existing Order in History</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      #{matchedTransaction.orderNumber}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 text-[11px]">Store:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{matchedTransaction.store}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 text-[11px]">Purchase Date:</span>
                      <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{matchedTransaction.date}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 text-[11px]">Total Amount:</span>
                      <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                        {formatPrice(matchedTransaction.totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 text-[11px]">Payment:</span>
                      <span className="text-[11px] truncate max-w-[130px]">{matchedTransaction.paymentMethod}</span>
                    </div>
                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Purchased Items:</span>
                      <div className="space-y-0.5 max-h-16 overflow-y-auto">
                        {matchedTransaction.items.map((it, idx) => (
                          <div key={idx} className="text-[10px] flex justify-between">
                            <span className="truncate pr-1">• {it.name}</span>
                            <span className="font-mono text-slate-500 shrink-0">{formatPrice(it.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Scanned Physical Receipt */}
                <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/80 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-800/60 pb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Scanned Physical Receipt</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      Slip #{selectedReceipt.orderNumber.substring(0, 10)}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 text-[11px]">Extracted Store:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{editableMerchant}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 text-[11px]">Receipt Date:</span>
                      <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{editableDate}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 text-[11px]">Extracted Sum:</span>
                      <span className="font-mono font-extrabold text-purple-600 dark:text-purple-400 text-sm">
                        {formatPrice(editableAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 text-[11px]">OCR Status:</span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{validationReport.confidenceScore}% Confidence</span>
                      </span>
                    </div>
                    <div className="pt-1 border-t border-purple-100 dark:border-purple-800/60">
                      <span className="text-[10px] text-slate-400 block mb-0.5">Parsed Items:</span>
                      <div className="space-y-0.5 max-h-16 overflow-y-auto">
                        {selectedReceipt.items.map((it, idx) => (
                          <div key={idx} className="text-[10px] flex justify-between">
                            <span className="truncate pr-1">• {it.name}</span>
                            <span className="font-mono text-slate-500 shrink-0">{formatPrice(it.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Verification Indicators */}
              <div className="flex items-center gap-2 flex-wrap text-[11px] text-indigo-900 dark:text-indigo-200 bg-white/70 dark:bg-slate-900/70 px-3 py-2 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60">
                <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-600 dark:text-indigo-400">Match Criteria:</span>
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Exact Amount ({formatPrice(editableAmount)})
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Date within 2 days ({matchedTransaction.date} vs {editableDate})
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Similar Store ({matchedTransaction.store} ≈ {editableMerchant})
                </span>
              </div>

              {/* Merge vs Keep Separate Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleMergeWithExisting}
                  className="flex-1 w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <GitMerge className="w-4 h-4" />
                  <span>Merge Receipt Image with Existing Transaction</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAddTransaction}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl font-bold text-xs bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <PlusCircle className="w-4 h-4 text-slate-500" />
                  <span>Keep Separate (Save as New)</span>
                </button>
              </div>
            </div>
          )}

          {/* Auto-Populated Fields Preview & Editable Confirmation Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Extracted PurchaseTransaction Details</span>
                </span>
                
                {scanningStage === 'completed' && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    validationReport.isLowConfidence
                      ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {validationReport.isLowConfidence ? (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        <span>Awaiting Confirmation</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3" />
                        <span>{isUserConfirmed ? 'User Verified' : 'OCR Validated'}</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Editable Fields: Merchant, Date, Amount with Real-Time Validation Feedback */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Merchant Input */}
                <div className={`p-3 rounded-xl border transition-colors ${
                  validationReport.merchantStatus === 'unrecognized' || validationReport.merchantStatus === 'fuzzy_matched'
                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Store className="w-3 h-3 text-purple-500" />
                      <span>Merchant</span>
                    </span>
                    {validationReport.merchantStatus === 'verified_known' && (
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">Known Store</span>
                    )}
                  </div>

                  <input
                    type="text"
                    value={editableMerchant}
                    onChange={(e) => {
                      setEditableMerchant(e.target.value);
                      setIsUserConfirmed(false);
                    }}
                    placeholder="Merchant Name"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                {/* 2. Date Input */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-indigo-500" />
                      <span>Date</span>
                    </span>
                  </div>

                  <input
                    type="date"
                    value={editableDate}
                    onChange={(e) => {
                      setEditableDate(e.target.value);
                      setIsUserConfirmed(false);
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                  />
                </div>

                {/* 3. Total Amount Input */}
                <div className={`p-3 rounded-xl border transition-colors ${
                  validationReport.amountStatus !== 'valid'
                    ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                    : 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-200/60 dark:border-purple-800/60'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span>Total Amount</span>
                    </span>
                    {validationReport.amountStatus === 'valid' && (
                      <span className="text-[9px] font-bold text-purple-600">Valid Sum</span>
                    )}
                  </div>

                  <div className="relative">
                    <span className="absolute left-2 top-1 text-xs font-mono font-bold text-purple-600">
                      {currency || '₹'}
                    </span>
                    <input
                      type="number"
                      value={editableAmount}
                      onChange={(e) => {
                        setEditableAmount(parseFloat(e.target.value) || 0);
                        setIsUserConfirmed(false);
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-6 pr-2 py-1 text-xs font-mono font-extrabold text-purple-700 dark:text-purple-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Known Merchants Quick Auto-Fill Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-slate-500">
                <span className="text-[10px] font-bold uppercase text-slate-400">Match Known:</span>
                {knownMerchants.slice(0, 5).map(store => (
                  <button
                    key={store}
                    onClick={() => {
                      setEditableMerchant(store);
                      setIsUserConfirmed(true);
                    }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
                      editableMerchant.toLowerCase() === store.toLowerCase()
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {store}
                  </button>
                ))}
              </div>

              {/* Itemized Line Items Preview */}
              <div className="text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400 border-b border-slate-200 dark:border-slate-700/60 pb-1">
                  <span>Parsed Line Items</span>
                  <span>Category: {selectedReceipt.storeCategory}</span>
                </div>
                {selectedReceipt.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span className="truncate pr-2">{it.quantity}x {it.name}</span>
                    <span className="font-mono font-semibold shrink-0">{formatPrice(it.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons: Confirm Details / Add Transaction / Retake */}
            <div className="pt-2">
              {hasMergedSuccess ? (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Receipt image merged into Order #{mergedTransaction?.orderNumber}!</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleReset}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer text-xs"
                    >
                      Snap Another
                    </button>
                    {onNavigateTab && (
                      <button
                        onClick={() => onNavigateTab('purchases')}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-50 cursor-pointer text-xs"
                      >
                        View Orders
                      </button>
                    )}
                  </div>
                </div>
              ) : hasAddedSuccess ? (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>PurchaseTransaction validated, auto-populated & saved!</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleReset}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer text-xs"
                    >
                      Snap Another
                    </button>
                    {onNavigateTab && (
                      <button
                        onClick={() => onNavigateTab('purchases')}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-50 cursor-pointer text-xs"
                      >
                        View Orders
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  {/* If match found, offer direct Merge vs Keep Separate buttons */}
                  {scanningStage === 'completed' && matchedTransaction ? (
                    <>
                      <button
                        type="button"
                        onClick={handleMergeWithExisting}
                        className="flex-1 w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <GitMerge className="w-4 h-4" />
                        <span>Merge with Order #{matchedTransaction.orderNumber}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmAddTransaction}
                        className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <PlusCircle className="w-4 h-4 text-slate-500" />
                        <span>Keep Separate</span>
                      </button>
                    </>
                  ) : scanningStage === 'completed' && validationReport.isLowConfidence && !isUserConfirmed ? (
                    <button
                      onClick={handleUserConfirmDetails}
                      className="flex-1 w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm & Accept Details ({validationReport.confidenceScore}%)</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleConfirmAddTransaction}
                      disabled={scanningStage !== 'completed'}
                      className={`flex-1 w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        scanningStage === 'completed'
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 active:scale-95'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Auto-Populate & Save to Purchases</span>
                    </button>
                  )}

                  {scanningStage === 'completed' && (
                    <button
                      onClick={handleReset}
                      className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs cursor-pointer shrink-0"
                    >
                      Retake
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
