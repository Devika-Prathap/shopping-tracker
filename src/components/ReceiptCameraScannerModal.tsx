import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Sparkles, 
  RotateCw, 
  Check, 
  AlertCircle, 
  Upload, 
  RefreshCw,
  Store,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PurchaseTransaction, ProductCategory, PurchaseItem } from '../types';

interface ReceiptCameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptScanned: (purchase: PurchaseTransaction) => void;
}

export const ReceiptCameraScannerModal: React.FC<ReceiptCameraScannerModalProps> = ({
  isOpen,
  onClose,
  onReceiptScanned,
}) => {
  const { currency, formatPrice } = useApp();

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  // Extracted preview and confirmation
  const [extractedData, setExtractedData] = useState<{
    merchant: string;
    date: string;
    totalAmount: number;
    currency: string;
    paymentMethod: string;
    orderNumber?: string;
    items: {
      name: string;
      price: number;
      quantity?: number;
      category: string;
      subCategory?: string;
    }[];
    rawSummary?: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    setAnalysisError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Prefer back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(err => {
          console.warn('Video play error:', err);
        });
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Camera access was not granted or is unavailable on this device. You can still upload or snap a receipt photo.');
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setExtractedData(null);
      setAnalysisError(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Capture image frame from active video stream
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
      analyzeReceiptImage(dataUrl);
    }
  };

  // Handle file upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCapturedImage(result);
      stopCamera();
      analyzeReceiptImage(result);
    };
    reader.readAsDataURL(file);
  };

  // Call Server-side Gemini AI Vision Endpoint
  const analyzeReceiptImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    setExtractedData(null);

    try {
      const response = await fetch('/api/receipts/scan-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType: 'image/jpeg',
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error ${response.status}`);
      }

      const data = await response.json();
      setExtractedData({
        merchant: data.merchant || 'Store',
        date: data.date || new Date().toISOString().split('T')[0],
        totalAmount: typeof data.totalAmount === 'number' ? data.totalAmount : parseFloat(data.totalAmount) || 0,
        currency: data.currency || currency || '₹',
        paymentMethod: data.paymentMethod || 'UPI / Card',
        orderNumber: data.orderNumber || `REC-${Math.floor(100000 + Math.random() * 900000)}`,
        items: Array.isArray(data.items) && data.items.length > 0 ? data.items : [
          {
            name: data.rawSummary || `${data.merchant || 'Store'} Purchase`,
            price: typeof data.totalAmount === 'number' ? data.totalAmount : 0,
            quantity: 1,
            category: 'Clothing',
            subCategory: 'General',
          }
        ],
        rawSummary: data.rawSummary,
      });
    } catch (err: any) {
      console.error('Receipt AI Vision error:', err);
      setAnalysisError('Could not parse receipt automatically. You can retake the photo or enter details manually.');
      // Provide fallback parsed template so user is not stuck
      setExtractedData({
        merchant: 'Scanned Merchant',
        date: new Date().toISOString().split('T')[0],
        totalAmount: 1250,
        currency: currency || '₹',
        paymentMethod: 'UPI / Card',
        orderNumber: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
        items: [
          {
            name: 'Paper Receipt Item',
            price: 1250,
            quantity: 1,
            category: 'Clothing',
            subCategory: 'Tops',
          }
        ],
        rawSummary: 'Manual adjustment needed',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Confirm and save parsed receipt transaction
  const handleConfirmReceipt = () => {
    if (!extractedData) return;

    const newItems: PurchaseItem[] = extractedData.items.map((it, idx) => ({
      id: `scanned-item-${Date.now()}-${idx}`,
      name: it.name || `${extractedData.merchant} Item`,
      price: it.price || extractedData.totalAmount || 0,
      quantity: it.quantity || 1,
      category: (it.category as ProductCategory) || 'Clothing',
      subCategory: it.subCategory || 'General',
      store: extractedData.merchant,
      date: extractedData.date,
      imageUrl: capturedImage || undefined,
      orderStatus: 'Delivered',
      tags: ['AI Camera Scan', extractedData.merchant],
    }));

    const newPurchase: PurchaseTransaction = {
      id: `scanned-tx-${Date.now()}`,
      orderNumber: extractedData.orderNumber || `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      store: extractedData.merchant,
      date: extractedData.date,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      subtotal: extractedData.totalAmount,
      discount: 0,
      deliveryCharges: 0,
      totalAmount: extractedData.totalAmount,
      currency: extractedData.currency || currency || '₹',
      paymentMethod: extractedData.paymentMethod || 'UPI / Card',
      source: 'email_receipt',
      items: newItems,
      orderStatus: 'Delivered',
      rawReceiptSnippet: `AI Receipt Scan: ${extractedData.merchant} - ${extractedData.rawSummary || 'Physical receipt photo'}`,
      tags: ['AI Camera Scan', extractedData.merchant],
    };

    onReceiptScanned(newPurchase);
    onClose();
  };

  // Retake photo
  const handleRetake = () => {
    setCapturedImage(null);
    setExtractedData(null);
    setAnalysisError(null);
    startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full sm:max-w-lg bg-white dark:bg-[#0c0f17] rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-slideUp text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile top handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-1.5">
                <span>Scan Receipt with AI</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-extrabold bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" />
                  Gemini
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Point your camera at a paper bill or upload a receipt photo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Viewport */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* CAMERA VIEWPORT OR CAPTURED IMAGE */}
          <div className="relative w-full aspect-4/3 sm:aspect-16/10 rounded-2xl bg-black overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
            {capturedImage ? (
              <img 
                src={capturedImage} 
                alt="Captured Receipt" 
                className="w-full h-full object-contain bg-black"
              />
            ) : cameraActive ? (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover"
                />
                {/* Visual alignment frame overlay */}
                <div className="absolute inset-4 sm:inset-6 border-2 border-dashed border-purple-400/70 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                  <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md self-start">
                    Align receipt here
                  </span>
                  <span className="text-[9px] text-white/80 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md self-center">
                    Ensure merchant, date and total amount are well-lit
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  {cameraError || 'Camera inactive. Click Snap or Upload to take a photo.'}
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 cursor-pointer transition-colors"
                  >
                    Start Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 cursor-pointer transition-colors"
                  >
                    Upload Photo
                  </button>
                </div>
              </div>
            )}

            {/* Hidden canvas for image capture snapshot */}
            <canvas ref={canvasRef} className="hidden" />
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              onChange={handleFileUpload} 
            />

            {/* Loading Analysis Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center space-y-3 p-4 z-20">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center animate-spin">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    AI Analyzing Receipt...
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Extracting merchant name, purchase date, and total amount
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Row when Camera is Live */}
          {!capturedImage && cameraActive && (
            <div className="flex items-center justify-around py-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-purple-600 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <span>Upload</span>
              </button>

              {/* Shutter Capture Button */}
              <button
                type="button"
                onClick={captureFrame}
                className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-500 border-4 border-white dark:border-slate-800 shadow-xl shadow-purple-600/30 flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                title="Capture Photo"
              >
                <div className="w-6 h-6 rounded-full bg-white" />
              </button>

              <button
                type="button"
                onClick={startCamera}
                className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-purple-600 cursor-pointer"
                title="Switch / Restart"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <RotateCw className="w-4 h-4" />
                </div>
                <span>Flip</span>
              </button>
            </div>
          )}

          {/* ANALYSIS RESULTS & EDITABLE CONFIRMATION CARD */}
          {extractedData && (
            <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-purple-200/60 dark:border-purple-800/40">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    AI Extracted Details
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="text-xs font-bold text-slate-500 hover:text-purple-600 dark:text-slate-400 cursor-pointer flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>Retake</span>
                </button>
              </div>

              {/* 3 Main AI Parsed Highlights: Merchant, Date, Amount */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Merchant
                  </span>
                  <input
                    type="text"
                    value={extractedData.merchant}
                    onChange={(e) => setExtractedData({ ...extractedData, merchant: e.target.value })}
                    className="w-full text-xs font-extrabold text-center text-slate-900 dark:text-white bg-transparent focus:outline-none focus:ring-1 focus:ring-purple-400 rounded"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Date
                  </span>
                  <input
                    type="date"
                    value={extractedData.date}
                    onChange={(e) => setExtractedData({ ...extractedData, date: e.target.value })}
                    className="w-full text-[11px] font-mono font-bold text-center text-slate-900 dark:text-white bg-transparent focus:outline-none focus:ring-1 focus:ring-purple-400 rounded"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block mb-0.5">
                    Amount
                  </span>
                  <div className="flex items-center justify-center font-mono font-extrabold text-xs text-purple-700 dark:text-purple-300">
                    <span className="text-slate-400 mr-0.5">{extractedData.currency}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={extractedData.totalAmount}
                      onChange={(e) => setExtractedData({ ...extractedData, totalAmount: parseFloat(e.target.value) || 0 })}
                      className="w-16 font-mono font-bold text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-purple-400 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Items Summary list */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Items ({extractedData.items.length})
                </span>
                <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1">
                  {extractedData.items.map((it, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs"
                    >
                      <div className="truncate mr-2">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                          {it.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {it.category}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">
                        {formatPrice(it.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirm / Save Button */}
              <button
                type="button"
                onClick={handleConfirmReceipt}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Add to Tracker</span>
              </button>
            </div>
          )}

          {analysisError && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-950 dark:text-amber-200">
                    Extraction Issue Detected {retryCount > 0 ? `(Attempt ${retryCount + 1})` : ''}
                  </h4>
                  <p className="text-amber-800 dark:text-amber-300/90 mt-0.5">
                    {analysisError}
                  </p>
                </div>
              </div>

              {/* Guided feedback tips */}
              <div className="space-y-1.5 pt-1.5 border-t border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
                <span className="font-bold block uppercase tracking-wider text-[10px] text-amber-800 dark:text-amber-400">
                  Guided Tips for Better OCR Extraction:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-start gap-1.5">
                    <Store className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Ensure merchant name is visible:</strong> Position store header clearly inside the top of the frame.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Avoid light glare:</strong> Tilt phone slightly to eliminate shiny reflections on thermal paper.</span>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setRetryCount(prev => prev + 1);
                    handleRetake();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retry Capture with Guidance</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
