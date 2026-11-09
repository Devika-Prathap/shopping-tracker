# Implementation Plan: 'Search Transactions' & Auto-Merge Receipt Flow

Update the **Extract Receipt** feature on the Dashboard to automatically search existing transaction history following OCR parsing. When a transaction matches the extracted amount, date (within ±2 days), and store name, display a side-by-side comparison prompt allowing the user to either auto-merge the receipt image with the existing purchase or save it as a separate record.

---

## 1. User-Approved Design Decisions
- **Presentation**: Show a side-by-side comparison card comparing the existing transaction against the scanned physical receipt, with distinct **Merge Receipt with Existing Transaction** and **Save as Separate Transaction** actions.
- **Search Criteria**: 
  - Exact amount match (`Math.abs(p.totalAmount - extractedAmount) < 1`)
  - Date within ±2 days (accounting for credit card posting delays vs. physical cash/card slips)
  - Similar/matching store name (exact or substring/fuzzy match)

---

## 2. Architectural Updates & Flow

```
[Camera Snapshot / Upload]
         ↓
[OCR Text & Boundary Extraction]
         ↓
[Automated Validation (Pattern & Directory Check)]
         ↓
[Step 5: Search Transactions in History]
    ├─ Match Found? ───► [Display Comparison Prompt]
    │                         ├── [Merge Receipt Image] ──► onUpdatePurchase(updatedTx)
    │                         └── [Keep Separate]      ──► onAddPurchase(newTx)
    │
    └─ No Match? ──────► [Standard Auto-Populate Flow] ──► onAddPurchase(newTx)
```

---

## 3. Detailed Changes Across Files

### A. `src/components/ExtractReceiptCard.tsx`
1. **Pipeline Stepper Expansion**:
   - Update `ScanningStage`: `'idle' | 'snapping' | 'detecting' | 'ocr' | 'validating' | 'searching' | 'completed' | 'failed'`.
   - Add step 5 in the telemetry bar: `1. Snap → 2. Edges → 3. OCR → 4. Validate → 5. Search Matches → 6. Ready`.
2. **Transaction Match Finder**:
   - Search the `purchases` prop:
     - Amount equality: `Math.abs(p.totalAmount - editableAmount) < 1`
     - Date tolerance: Date difference between `p.date` and `editableDate` is $\le 2$ days.
     - Store similarity: `cleanStoreName(p.store) === cleanStoreName(editableMerchant)` or substring overlap.
   - If match found, store `matchedTransaction: PurchaseTransaction`.
3. **Comparison & Merge Prompt Card**:
   - Side-by-side display comparing:
     - **Existing Transaction**: Order #, Store, Date, Payment method, and line item summary.
     - **Scanned Receipt**: Scanned merchant, slip date, OCR confidence score, and paper preview.
   - Actions:
     - **Merge Receipt Image**: Attaches `rawReceiptSnippet`, receipt image, and tag `['Physical Receipt Attached', 'Verified Receipt Image']` to the existing transaction; updates timestamp and calls `onUpdatePurchase(mergedTx)`.
     - **Save as New Separate Transaction**: Proceeds with normal `onAddPurchase` creation.
4. **Preset Scenarios**:
   - Add a dedicated preset matching an existing transaction in the dataset (e.g. `Myntra Sneaker Slip` matching `MYN-9982410` for `₹2,999` on `2026-09-30`, or `Sony Headphones` matching `AMZ-402-9918231` for `₹3,499` on `2026-09-28`).

### B. `src/components/DashboardView.tsx`
- Accept `onUpdatePurchase?: (purchase: PurchaseTransaction) => void` in `DashboardViewProps`.
- Pass `onUpdatePurchase` to `<ExtractReceiptCard purchases={purchases} onAddPurchase={onAddPurchase} onUpdatePurchase={onUpdatePurchase} />`.

### C. `src/App.tsx`
- Pass `handleUpdatePurchase` to `<DashboardView>` so changes to existing transactions persist into `localStorage` and trigger user toasts.

---

## 4. Verification & Testing
- Test exact amount with matching date within 2 days to confirm match identification.
- Verify 1-click **Merge Receipt Image** updates the existing purchase, appends the verified tag, and reflects in transaction history without duplicating spend.
- Verify **Save as Separate** still works as expected when user desires a distinct entry.
- Run `lint_applet` and `compile_applet` to guarantee type safety and build success.
