# PDF Export & Share Functionality - Implementation Guide

## ✅ What's Been Implemented

### 1. **Database Migration**
- **File**: `migrations/019_create_shared_reports.sql`
- Creates `shared_reports` table for time-limited report sharing
- Stores: prediction_id, share_token, expires_at, created_by_user_id
- Includes indexes for fast lookups

### 2. **PDF Export Library**
- **File**: `src/lib/pdf-export.ts`
- Uses `html2canvas` + `jsPDF` for PDF generation
- Function: `exportToPDF(element, options)`
- Captures any HTML element and converts to PDF
- Supports multi-page PDFs for long reports

### 3. **Share API Endpoints**

#### Create Share Link
- **POST** `/api/reports/share`
- Body: `{ predictionId, expiryDays }`
- Returns: `{ shareUrl, expiresAt, shareToken }`
- Generates unique token and expiration date

#### Get Active Shares
- **GET** `/api/reports/share`
- Returns all active share links for logged-in user

#### View Shared Report
- **GET** `/api/reports/shared/[token]`
- Public endpoint (no auth required)
- Returns prediction data if token valid and not expired

### 4. **ReportActions Component**
- **File**: `src/components/report-actions.tsx`
- Reusable component for all report pages
- Features:
  - **Export PDF** button with loading state
  - **Share** button with dialog
  - Expiry selection (1, 3, 7, 14, 30 days)
  - Copy link to clipboard
  - Full i18n support

### 5. **Public Shared Report Page**
- **File**: `src/app/shared/report/[token]/page.tsx`
- Public page for non-logged users
- Shows expiration date
- Displays report content based on analysis type
- Handles expired/invalid links gracefully

### 6. **i18n Translations**
All static labels translated in 5 languages:

**English** (`messages/en.json`):
- share, exportPdf, shareReport, shareDescription
- expiryDays, days, generateLink, shareLink
- copyLink, linkCopied, generating, exporting

**Chinese** (`messages/zh.json`):
- 分享, 导出PDF, 分享报告, 生成一个有效期限的分享链接
- 有效期天数, 天, 生成链接, 分享链接
- 复制链接, 链接已复制到剪贴板！

**Malay** (`messages/ms.json`):
- Kongsi, Eksport PDF, Kongsi Laporan
- Jana pautan perkongsian yang tamat tempoh

**Japanese** (`messages/ja.json`):
- 共有, PDFエクスポート, レポートを共有
- 有効期限付きの共有リンクを生成

**Korean** (`messages/ko.json`):
- 공유, PDF 내보내기, 보고서 공유
- 만료 기간이 있는 공유 링크 생성

## 🎯 How to Use

### For Developers

#### 1. Run the Migration
```sql
-- Run this on your Neon database
\i migrations/019_create_shared_reports.sql
```

#### 2. Add ReportActions to Any Report Page
```tsx
import { ReportActions } from '@/components/report-actions'
import { useTranslations } from 'next-intl'

function MyReportPage() {
  const t = useTranslations('report')
  
  return (
    <div id="report-content">
      <ReportActions
        predictionId={reportId}
        reportElementId="report-content"
        reportTitle="My_Report_Name"
        translations={{
          share: t('share'),
          exportPdf: t('exportPdf'),
          shareReport: t('shareReport'),
          shareDescription: t('shareDescription'),
          expiryDays: t('expiryDays'),
          days: t('days'),
          generateLink: t('generateLink'),
          shareLink: t('shareLink'),
          copyLink: t('copyLink'),
          linkCopied: t('linkCopied')
        }}
      />
      
      {/* Your report content */}
    </div>
  )
}
```

### For Users

#### Export PDF
1. Open any analysis report
2. Click "Export PDF" button (top right)
3. PDF downloads automatically
4. Filename: `{analysis_type}_{person_name}_{date}.pdf`

#### Share Report
1. Open any analysis report
2. Click "Share" button (top right)
3. Select expiry period (1-30 days)
4. Click "Generate Link"
5. Copy link and share with anyone
6. Recipients can view without logging in

#### View Shared Report
1. Receive share link: `https://yoursite.com/shared/report/{token}`
2. Click link (no login required)
3. View full report
4. Link expires after set period

## 📊 Report Pages to Update

### ✅ Already Updated
- `src/app/dashboard/prediction-report/page.tsx` - Main prediction report

### 🔄 Need to Add ReportActions
1. **Zodiac Analysis Report**
   - File: Check if separate report page exists
   - Or uses prediction-report page

2. **Monthly Prediction Report**
   - File: `src/app/dashboard/monthly-prediction/page.tsx`
   - Add ReportActions component

3. **Yearly Prediction Report**
   - File: `src/app/dashboard/yearly-prediction/page.tsx`
   - Add ReportActions component

4. **Compatibility Reports**
   - File: `src/app/dashboard/compatibility-report/page.tsx`
   - Add ReportActions component

5. **Destiny Profile Report**
   - File: `src/app/dashboard/destiny-profile/page.tsx`
   - Add ReportActions component

## 🌐 i18n Implementation

### Static Labels (Translated)
All UI labels change based on language selector:
- Button text
- Dialog titles
- Form labels
- Success messages

### Analysis Data (Original Language)
Report content remains in the language it was analyzed:
- If analyzed in Chinese → Data stays in Chinese
- If analyzed in English → Data stays in English
- Only UI controls translate

### How It Works
```tsx
// UI labels use translations
<Button>{t('exportPdf')}</Button>

// Analysis data stays original
<p>{report.result_data.overview}</p>
```

## 🔒 Security Features

1. **Token-based Access**
   - Unique 64-character hex tokens
   - Cryptographically secure (crypto.randomBytes)

2. **Time-limited Access**
   - Configurable expiry (1-30 days)
   - Automatic expiration check
   - Expired links return 404

3. **User Ownership**
   - Only report owner can create share links
   - Verification before link generation

4. **No Sensitive Data in URL**
   - Only token in URL
   - Actual data fetched server-side

## 📝 API Reference

### POST /api/reports/share
Create a share link for a prediction report.

**Request:**
```json
{
  "predictionId": "uuid",
  "expiryDays": 7
}
```

**Response:**
```json
{
  "success": true,
  "shareUrl": "https://yoursite.com/shared/report/abc123...",
  "expiresAt": "2026-01-11T00:00:00.000Z",
  "shareToken": "abc123..."
}
```

### GET /api/reports/share
Get all active share links for current user.

**Response:**
```json
[
  {
    "id": "uuid",
    "prediction_id": "uuid",
    "share_token": "abc123...",
    "expires_at": "2026-01-11T00:00:00.000Z",
    "analysis_type": "wczodiac",
    "person_name": "John Doe"
  }
]
```

### GET /api/reports/shared/[token]
View a shared report (public, no auth).

**Response:**
```json
{
  "prediction": {
    "id": "uuid",
    "analysis_type": "wczodiac",
    "result_data": { ... },
    "person": {
      "name": "John Doe",
      "birth_date": "1990-01-01"
    },
    "created_at": "2026-01-04T00:00:00.000Z"
  },
  "expiresAt": "2026-01-11T00:00:00.000Z"
}
```

## 🎨 UI Components

### ReportActions Props
```typescript
interface ReportActionsProps {
  predictionId: string        // UUID of the prediction
  reportElementId: string      // DOM element ID to capture for PDF
  reportTitle: string          // Filename for PDF (without .pdf)
  translations?: {             // i18n translations
    share?: string
    exportPdf?: string
    shareReport?: string
    shareDescription?: string
    expiryDays?: string
    days?: string
    generateLink?: string
    shareLink?: string
    copyLink?: string
    linkCopied?: string
  }
}
```

## 🚀 Next Steps

1. **Run Migration**
   ```bash
   psql $DATABASE_URL -f migrations/019_create_shared_reports.sql
   ```

2. **Test PDF Export**
   - Open prediction report
   - Click Export PDF
   - Verify PDF quality

3. **Test Sharing**
   - Generate share link
   - Open in incognito/different browser
   - Verify access works
   - Wait for expiry and verify denial

4. **Add to Other Report Pages**
   - Copy ReportActions integration
   - Update all report pages
   - Test each page

5. **Optional Enhancements**
   - Add PDF styling/branding
   - Email share links
   - Share link management page
   - Analytics on shared views

## 🐛 Troubleshooting

### PDF Export Issues
- **Blank PDF**: Check element ID matches
- **Cut-off Content**: Increase scale option
- **Missing Styles**: Ensure CSS is loaded

### Share Link Issues
- **404 Error**: Check migration ran successfully
- **Expired Immediately**: Check server timezone
- **Can't Generate**: Verify user owns prediction

### i18n Issues
- **Labels Not Translating**: Check useTranslations hook
- **Missing Keys**: Add to all language files
- **Wrong Language**: Check language selector

## ✅ Testing Checklist

- [ ] Migration runs successfully
- [ ] PDF export works on all report types
- [ ] Share link generates correctly
- [ ] Share link expires after set time
- [ ] Non-logged users can view shared reports
- [ ] Expired links show error message
- [ ] All languages show correct translations
- [ ] Analysis data stays in original language
- [ ] Copy link to clipboard works
- [ ] Mobile responsive design works

## 📚 Dependencies

Already installed in `package.json`:
- `jspdf`: ^3.0.4
- `html2canvas`: ^1.4.1
- `next-intl`: ^4.6.1

No additional packages needed!

---

**Implementation Status**: ✅ Core functionality complete
**Next**: Add ReportActions to remaining report pages
