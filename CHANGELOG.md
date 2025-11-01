# Changelog

## [1.4.0] - 2025-11-01
### Added
- **Multi-page PDF support**: Automatic page breaks with intelligent spacing optimization
- **Header on every page**: Full header with logo/branding, sender/recipient info, and offer details on all pages
- **Footer on every page**: Company details, bank information, legal info, and page numbers on all pages (German trade standard)
- **Signature section**: Legally binding signature lines for customer and craftsman with legal explanation text
- **German number formatting**: Thousand separators (1.000,00 EUR) and comma decimal separator
- **Bauvorhaben field**: Optional project location field in PDF
- **Offer validity days**: Configurable offer validity period with customizable text

### Improved
- **Page break optimization**: Smart logic prevents unnecessary page creation, better space utilization
- **Table continuation**: Table headers automatically repeat on new pages
- **Page numbering**: "Seite X von Y" format in footer
- **Content positioning**: Better vertical spacing and layout optimization

### Technical
- Enhanced PDF generation with dynamic page management
- Improved page break detection with configurable minimum Y position (140px default)
- Better handling of long content lists and descriptions

### Docs
- Updated `docs/PDF_GENERATION.md` with comprehensive multi-page support documentation
- Added page break logic and German formatting sections

## [1.3.0] - 2025-09-26
### Added
- Offer editor: “Position hinzufügen” button for Pro users on `src/app/angebot/[id]/page.tsx`.
- Feedback system: Summary email to admin when feedback with text is submitted.
  - Only sent if a text is present (thumbs-only does not send email).

### Docs
- New `docs/FEEDBACK_SYSTEM.md` (UI, API, email, env setup).
- Updated `docs/DEPLOYMENT_CHECKLIST.md` with `ADMIN_EMAIL` and email tests.
- Updated `docs/DOCUMENTATION_OVERVIEW.md` to link feedback docs.

## [1.2.0] - 2025-09-01
- Referral system, multi-channel sharing, hard paywall – see docs.

## [1.1.0] - 2025-08-01
- Stripe subscription system, PDF generation – see docs.
