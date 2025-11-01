# PDF Generation via pdf-lib

## Overview

AngebotNow uses `pdf-lib` for professional PDF generation with advanced multi-page support, intelligent page breaks, and comprehensive legal document features. PDFs are generated on-demand via API routes and served as downloads.

## Implementation Details

### Dependencies
- **pdf-lib**: Modern PDF generation library that works in both Node.js and browser environments
- **Removed**: @react-pdf/renderer (was causing Node-only import issues)

### API Route
- **Endpoint**: `/api/quotes/[id]/pdf`
- **Method**: GET
- **Response**: PDF file as download with proper headers
- **Headers**:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="angebot_<id>.pdf"`
  - `Cache-Control: no-store`

### PDF Structure
The generated PDF includes:
- **Company logo** (PRO users only, positioned top-left with proper aspect ratio)
- **Company header** (AngebotNow branding for FREE users)
- **Header on every page** - Full header with logo/branding, sender info, recipient info, offer number, and date
- **Footer on every page** - Company details, bank information, legal info, and page numbers
- Quote number and date
- Client information (name and address if provided)
- **Bauvorhaben (BV) field** (if provided):
  - Optional field for project location/address
  - Displayed above project description as "BV: [address]"
  - Can be automatically filled from client address or entered separately
  - Format: "BV: [street], [city]" or custom text
- Project description (with text wrapping)
- AI-generated positions table with:
  - Position numbers
  - Titles (bold) and descriptions
  - Quantities and units
  - Prices with German number formatting (1.000,00 EUR)
- Total calculation (Subtotal, VAT 19%, Grand Total)
- **Offer validity statement** with customizable validity days:
  - Positioned above signature section
  - Format: "Dieses Angebot ist X Tage ab Ausstellungsdatum gültig. Nach Ablauf dieser Frist behalten wir uns vor, Preise und Leistungen anzupassen."
  - Validity days configurable per user in settings (default: 30 days)
  - Automatically calculated from user's `offerValidityDays` setting
- **Signature section** with legally binding signature lines:
  - "Ort, Datum" line
  - "Unterschrift Kunde" line
  - "Unterschrift Handwerker" line
  - Legal explanation text
- Professional formatting with Helvetica fonts

### Multi-Page Support

PDFs automatically support multiple pages with:
- **Intelligent page breaks**: Automatically creates new pages when content exceeds available space
- **Header repetition**: Full header appears on every page for better readability
- **Footer repetition**: Important company and legal information on every page (industry standard in German trade)
- **Table continuation**: Table headers repeat on new pages
- **Page numbers**: "Seite X von Y" format in footer
- **Optimized spacing**: Smart page break logic prevents unnecessary page creation

### Page Break Logic

The system uses intelligent page break detection:
- **Minimum Y position**: `minY = 140px` (configurable via `bottomMargin`)
- **Position-based checks**: Different space requirements for last vs. intermediate positions
- **Automatic detection**: Checks if content fits before drawing
- **Footer protection**: Ensures content never overlaps with footer (80px height + 60px margin)

### German Number Formatting

All monetary values are formatted in German standard:
- **Thousand separators**: Points (.) e.g., `1.000,00 EUR`
- **Decimal separator**: Comma (,) e.g., `1.234,56 EUR`
- Applied to all prices, subtotals, VAT, and totals

### Usage
PDFs are automatically generated when:
1. User creates a new quote via `/dashboard`
2. AI processing completes successfully
3. User clicks "PDF herunterladen" button on quote detail pages

### Benefits
- **No Node-only imports**: Works in both server and client environments
- **On-demand generation**: PDFs are created fresh each time
- **No file storage**: Eliminates need for PDF file management
- **Better performance**: Smaller bundle size, faster builds
- **Modern API**: Uses Next.js 15 App Router patterns
- **Professional appearance**: Multi-page support with headers/footers on every page
- **Legal compliance**: Signature sections for binding offers
- **Industry standard**: Follows German trade document conventions

## Technical Notes

- PDF generation happens in API routes (server-side only)
- Uses `Buffer.from()` to convert `Uint8Array` to proper response format
- Handles async params correctly for Next.js 15
- Includes proper error handling and status codes
- **Logo Integration**: PRO users' company logos are automatically embedded in PDFs
- **Logo Positioning**: Logos are positioned top-left with intelligent aspect ratio preservation
- **Format Support**: PNG and JPG logos are supported with automatic format detection
- **Page Management**: Tracks all pages for page numbering
- **Dynamic Content**: Handles variable content lengths with automatic pagination

## Related Documentation

- [LOGO_UPLOAD_FEATURE.md](./LOGO_UPLOAD_FEATURE.md) - Complete logo upload feature documentation
- [USER_DATA_INTEGRATION.md](./USER_DATA_INTEGRATION.md) - User data management and PDF integration
