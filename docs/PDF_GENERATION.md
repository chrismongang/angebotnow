# PDF Generation via pdf-lib

## Overview

AngebotNow now uses `pdf-lib` for PDF generation instead of the previous placeholder implementation. PDFs are generated on-demand via API routes and served as downloads.

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
- Company header (AngebotNow branding for FREE users)
- Quote number and date
- Client information
- Project description (with text wrapping)
- AI-generated positions (if available)
- Total calculation
- Professional formatting with Helvetica fonts

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

## Technical Notes

- PDF generation happens in API routes (server-side only)
- Uses `Buffer.from()` to convert `Uint8Array` to proper response format
- Handles async params correctly for Next.js 15
- Includes proper error handling and status codes
- **Logo Integration**: PRO users' company logos are automatically embedded in PDFs
- **Logo Positioning**: Logos are positioned top-left with intelligent aspect ratio preservation
- **Format Support**: PNG and JPG logos are supported with automatic format detection

## Related Documentation

- [LOGO_UPLOAD_FEATURE.md](./LOGO_UPLOAD_FEATURE.md) - Complete logo upload feature documentation
- [USER_DATA_INTEGRATION.md](./USER_DATA_INTEGRATION.md) - User data management and PDF integration
