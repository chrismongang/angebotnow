import { PDFDocument, StandardFonts, rgb, grayscale, PDFPage } from 'pdf-lib';

export type QuotePosition = { title: string; description: string; qty: number; unit: string; price: number };
export type GeneratePDFInput = {
  clientName: string;
  projectInfo: string;
  positions?: QuotePosition[];
  total?: number;
  quoteNumber?: string;
  clientStreet?: string;
  clientCity?: string;
  bauvorhaben?: string;
  offerValidityDays?: number; // Gültigkeitsdauer für Angebote in Tagen
  excludeVAT?: boolean; // § 13b UStG - Steuerschuldnerschaft des Leistungsempfängers
  company?: { 
    name?: string; 
    address?: string; 
    email?: string; 
    phone?: string;
    taxNumber?: string;
    vatNumber?: string;
    taxOffice?: string;
    bankName?: string;
    bankAccount?: string;
    bankBic?: string;
    logo?: string;
  };
  userSubscriptionTier?: 'FREE' | 'PRO';
};

export async function generatePDF(input: GeneratePDFInput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Define page margins - Footer needs ~140px at bottom
  const topMargin = 40;
  const bottomMargin = 120; // Space for footer (70px) + margin (50px)
  const minY = bottomMargin; // Minimum Y position before creating new page
  const footerY = 80; // Footer starts at this Y position

  // Track all pages for page numbers
  const pages: PDFPage[] = [page];

  // Helper function to get current page
  const getCurrentPage = (): PDFPage => page;

  // Helper function to check if a value is meaningful
  const isValidText = (text: string | undefined | null): text is string => {
    return Boolean(text && text.trim().length > 0);
  };

  // Function to format numbers with German format: 1.000,00 EUR
  const formatCurrency = (amount: number): string => {
    const fixed = amount.toFixed(2);
    const parts = fixed.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    // Add thousand separators (points)
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Return with comma as decimal separator
    return `${formattedInteger},${decimalPart}`;
  };

  const drawText = (text: string, x: number, y: number, size = 11, bold = false, color: any = rgb(0, 0, 0), targetPage?: PDFPage) => {
    const target = targetPage || getCurrentPage();
    target.drawText(text, { x, y, size, font: bold ? fontBold : font, color });
  };

  // Function to wrap text to fit within a specified width
  const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
    // First, split by newlines to handle multi-line input
    const inputLines = text.split('\n');
    const allWrappedLines: string[] = [];
    
    // Wrap each line separately
    for (const inputLine of inputLines) {
      const words = inputLine.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Word is too long, split it
            lines.push(word);
          }
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }
      
      // Add wrapped lines for this input line
      allWrappedLines.push(...lines);
    }
    
    return allWrappedLines;
  };

  // Function to draw wrapped text
  const drawWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number, bold = false, color: any = rgb(0, 0, 0), targetPage?: PDFPage): number => {
    const target = targetPage || getCurrentPage();
    const lines = wrapText(text, maxWidth, fontSize);
    lines.forEach((line, index) => {
      target.drawText(line, { 
        x, 
        y: y - (index * (fontSize + 2)), 
        size: fontSize, 
        font: bold ? fontBold : font, 
        color 
      });
    });
    return lines.length; // Return number of lines for spacing calculation
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number, thickness = 1, targetPage?: PDFPage) => {
    const target = targetPage || getCurrentPage();
    target.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness,
      color: grayscale(0.8)
    });
  };

  // Function to draw footer (called on EVERY page)
  const drawFooter = (targetPage: PDFPage, pageNumber?: number, totalPages?: number) => {
    const recipientX = 40;
    
    // Draw separator line
    drawLine(recipientX, footerY + 20, width - 40, footerY + 20, 1, targetPage);
    
    const footerCol1X = recipientX;
    const footerCol2X = width / 2 - 80;
    const footerCol3X = width - 200;
    
    // Column 1 - Company details
    if (input.company && isValidText(input.company.name)) drawText(input.company.name, footerCol1X, footerY, 8, false, rgb(0, 0, 0), targetPage);
    if (input.company && isValidText(input.company.address)) {
      const addressLines = input.company.address.split('\n');
      addressLines.forEach((line, index) => {
        if (isValidText(line)) {
          drawText(line, footerCol1X, footerY - 12 - (index * 12), 8, false, rgb(0, 0, 0), targetPage);
        }
      });
    }
    if (input.company && isValidText(input.company.email)) drawText(`E-Mail: ${input.company.email}`, footerCol1X, footerY - 48, 8, false, rgb(0, 0, 0), targetPage);
    if (input.company && isValidText(input.company.phone)) drawText(`Tel: ${input.company.phone}`, footerCol1X, footerY - 60, 8, false, rgb(0, 0, 0), targetPage);
    
    // Column 2 - Bank details
    if (input.company && isValidText(input.company.bankName)) drawText(`Kreditinstitut: ${input.company.bankName}`, footerCol2X, footerY, 8, false, rgb(0, 0, 0), targetPage);
    if (input.company && isValidText(input.company.bankAccount)) drawText(`IBAN: ${input.company.bankAccount}`, footerCol2X, footerY - 12, 8, false, rgb(0, 0, 0), targetPage);
    if (input.company && isValidText(input.company.bankBic)) drawText(`BIC: ${input.company.bankBic}`, footerCol2X, footerY - 24, 8, false, rgb(0, 0, 0), targetPage);
    
    // Column 3 - Legal info
    if (input.company && isValidText(input.company.vatNumber)) drawText(`USt-ID: ${input.company.vatNumber}`, footerCol3X, footerY, 8, false, rgb(0, 0, 0), targetPage);
    if (input.company && isValidText(input.company.taxNumber)) drawText(`Steuer-Nr.: ${input.company.taxNumber}`, footerCol3X, footerY - 12, 8, false, rgb(0, 0, 0), targetPage);
    if (input.company && isValidText(input.company.taxOffice)) drawText(input.company.taxOffice, footerCol3X, footerY - 24, 8, false, rgb(0, 0, 0), targetPage);
    
    // Page number (professional touch)
    if (pageNumber && totalPages) {
      const pageNumberText = `Seite ${pageNumber} von ${totalPages}`;
      const pageNumberWidth = font.widthOfTextAtSize(pageNumberText, 8);
      drawText(pageNumberText, width - 40 - pageNumberWidth, footerY - 72, 8, false, grayscale(0.5), targetPage);
    }
  };

  // Function to draw table header (reusable for new pages)
  const drawTableHeader = (y: number, targetPage: PDFPage) => {
    const tableX = 40;
    const col1Width = 40;
    const col2Width = 200;
    const col3Width = 60;
    const col4Width = 60;
    const col5Width = 80;
    const col6Width = 80;

    targetPage.drawRectangle({
      x: tableX - 5,
      y: y - 5,
      width: col1Width + col2Width + col3Width + col4Width + col5Width + col6Width + 10,
      height: 20,
      color: grayscale(0.95)
    });

    drawText('Pos', tableX, y, 10, true, rgb(0, 0, 0), targetPage);
    drawText('Bezeichnung', tableX + col1Width, y, 10, true, rgb(0, 0, 0), targetPage);
    drawText('Menge', tableX + col1Width + col2Width, y, 10, true, rgb(0, 0, 0), targetPage);
    drawText('Einheit', tableX + col1Width + col2Width + col3Width, y, 10, true, rgb(0, 0, 0), targetPage);
    drawText('Einzelpreis', tableX + col1Width + col2Width + col3Width + col4Width, y, 10, true, rgb(0, 0, 0), targetPage);
    drawText('Gesamtpreis', tableX + col1Width + col2Width + col3Width + col4Width + col5Width, y, 10, true, rgb(0, 0, 0), targetPage);
  };

  // Load logo once (if PRO user) - needed for header on all pages
  let logoImage: any = null;
  let logoDimensions: { width: number; height: number } | null = null;

  if (input.userSubscriptionTier === 'PRO' && input.company?.logo) {
    try {
      const logoResponse = await fetch(input.company.logo);
      if (logoResponse.ok) {
        const logoBytes = await logoResponse.arrayBuffer();
        
        try {
          logoImage = await pdfDoc.embedPng(logoBytes);
        } catch (pngError) {
          try {
            logoImage = await pdfDoc.embedJpg(logoBytes);
          } catch (jpgError) {
            console.warn('Logo konnte nicht als PNG oder JPG geladen werden:', jpgError);
            logoImage = null;
          }
        }
        
        if (logoImage) {
          const maxWidth = 250;
          const maxHeight = 60;
          const imageWidth = logoImage.width;
          const imageHeight = logoImage.height;
          const aspectRatio = imageWidth / imageHeight;
          
          let logoWidth = maxWidth;
          let logoHeight = maxWidth / aspectRatio;
          
          if (logoHeight > maxHeight) {
            logoHeight = maxHeight;
            logoWidth = maxHeight * aspectRatio;
          }
          
          logoDimensions = { width: logoWidth, height: logoHeight };
        }
      }
    } catch (error) {
      console.warn('Logo konnte nicht geladen werden:', error);
    }
  }

  // Function to draw header (called on EVERY page)
  const drawHeader = (targetPage: PDFPage) => {
    const recipientX = 40;
    const senderX = width - 200;
    const shouldShowBranding = input.userSubscriptionTier !== 'PRO';
    
    // Branding left side (AngebotNow + Tagline) - Only show for Free users
    if (shouldShowBranding) {
      const brandingX = 40;
      const brandingY = height - 40;
      drawText('AngebotNow', brandingX, brandingY, 18, true, rgb(0.973, 0.596, 0.075), targetPage);
      drawText('Professionelle Angebotserstellung', brandingX, brandingY - 20, 10, false, grayscale(0.5), targetPage);
    }

    // Logo für PRO-User (links oben)
    if (logoImage && logoDimensions) {
      const logoX = 40;
      const logoY = height - 80;
      targetPage.drawImage(logoImage, {
        x: logoX,
        y: logoY,
        width: logoDimensions.width,
        height: logoDimensions.height,
      });
    }

    // Sender information (top right)
    const senderY = height - 80;
    
    if (input.company && isValidText(input.company.name)) drawText(input.company.name, senderX, senderY, 12, true, rgb(0, 0, 0), targetPage);
    if (input.company && isValidText(input.company.address)) {
      const addressLines = input.company.address.split('\n');
      addressLines.forEach((line, index) => {
        if (isValidText(line)) {
          drawText(line, senderX, senderY - 16 - (index * 16), 10, false, rgb(0, 0, 0), targetPage);
        }
      });
    }
    if (input.company && isValidText(input.company.email)) drawText(`${input.company.email}`, senderX, senderY - 48, 10, false, rgb(0, 0, 0), targetPage);
    if (input.company && isValidText(input.company.phone)) drawText(`Tel.: ${input.company.phone}`, senderX, senderY - 64, 10, false, rgb(0, 0, 0), targetPage);

    // Recipient information (top left, below branding)
    const recipientY = height - 120;
    
    // Sender address for window envelope (light gray)
    if (input.company && isValidText(input.company.name) && isValidText(input.company.address)) {
      const senderAddress = `${input.company.name} - ${input.company.address.replace('\n', ' ')}`;
      drawText(senderAddress, recipientX, recipientY + 20, 10, false, grayscale(0.5), targetPage);
    }
    
    drawText(input.clientName, recipientX, recipientY, 12, true, rgb(0, 0, 0), targetPage);
    
    // Client address (if provided)
    if (input.clientStreet || input.clientCity) {
      const clientAddress = [input.clientStreet, input.clientCity].filter(Boolean).join('\n');
      const addressLines = clientAddress.split('\n');
      addressLines.forEach((line, index) => {
        drawText(line, recipientX, recipientY - 16 - (index * 16), 10, false, rgb(0, 0, 0), targetPage);
      });
    }

    // Offer details section
    const offerY = recipientY - 80;
    
    // Main title "Angebot"
    drawText('Angebot', recipientX, offerY, 16, true, rgb(0, 0, 0), targetPage);
    
    // Offer number and date
    const currentDate = new Date().toLocaleDateString('de-DE');
    const offerNumber = input.quoteNumber || 'DEMO';
    
    drawText(`Angebot-Nr.: ${offerNumber}`, recipientX, offerY - 20, 10, false, rgb(0, 0, 0), targetPage);
    drawText(`Datum: ${currentDate}`, senderX, offerY - 20, 10, false, rgb(0, 0, 0), targetPage);

    // Separator line
    drawLine(recipientX, offerY - 40, width - 40, offerY - 40, 1, targetPage);
  };

  // Function to create a new page with header and footer
  const createNewPage = (): PDFPage => {
    const newPage = pdfDoc.addPage([595.28, 841.89]);
    // Draw header and footer immediately on new page
    drawHeader(newPage);
    drawFooter(newPage);
    pages.push(newPage);
    return newPage;
  };

  // Draw header and footer on first page
  drawHeader(page);
  drawFooter(page);

  // Content starts after header
  const recipientX = 40;
  const offerY = (height - 120) - 80; // Same calculation as in drawHeader
  const salutationY = offerY - 70;
  
  // Bauvorhaben über der Projektbeschreibung (wenn vorhanden)
  let currentContentY = salutationY;
  if (input.bauvorhaben && input.bauvorhaben.trim()) {
    drawText('BV:', recipientX, currentContentY, 11, true, rgb(0, 0, 0), page);
    drawText(input.bauvorhaben, recipientX + 40, currentContentY, 11, false, rgb(0, 0, 0), page);
    currentContentY -= 25; // Abstand zwischen BV und Projektbeschreibung
  }
  
  // Project summary only (no greeting or introduction text)
  const projectSummary = input.projectInfo || 'Arbeitsleistung';
  drawText(projectSummary, recipientX, currentContentY, 11, false, rgb(0, 0, 0), page);

  // Positions table
  let currentY = currentContentY - 30; // Reduced space since we removed greeting
  const tableX = recipientX;
  const col1Width = 40;   // Pos
  const col2Width = 200;  // Bezeichnung
  const col3Width = 60;   // Menge
  const col4Width = 60;   // Einheit
  const col5Width = 80;   // Einzelpreis
  const col6Width = 80;   // Gesamtpreis

  // Draw initial table header
  drawTableHeader(currentY, page);
  currentY -= 25; // Space below header
  
  let subtotal = 0;

  if (input.positions && input.positions.length > 0) {
    input.positions.forEach((position, index) => {
      const positionTotal = position.qty * position.price;
      subtotal += positionTotal;
      
      // Calculate available width for description (with some padding)
      const descriptionMaxWidth = col2Width - 10;
      
      // Calculate row height BEFORE drawing to check page break
      const titleLinesCount = wrapText(position.title, descriptionMaxWidth, 10).length;
      const descriptionLinesCount = wrapText(position.description, descriptionMaxWidth, 9).length;
      const totalLines = titleLinesCount + descriptionLinesCount;
      const rowHeight = Math.max(25, totalLines * 12 + 5);
      
      // Check if we need a new page BEFORE drawing this row
      // We need space for: row + at least one more row (minimum 30px) + totals section (approx 150px)
      const requiredSpace = rowHeight + 30 + 150;
      
      if (currentY - rowHeight < minY) {
        // Create new page with header and footer
        page = createNewPage();
        // Content starts after header - same position as first page
        // First page: recipientY = height - 120, offerY = recipientY - 80, salutationY = offerY - 70, tableY = salutationY - 30
        // So table starts at: height - 120 - 80 - 70 - 30 = height - 300
        const tableY = height - 300;
        currentY = tableY - 25; // Space below header row
        
        // Draw table header on new page
        drawTableHeader(tableY, page);
      }
      
      // Now draw the position row
      drawText((index + 1).toString(), tableX, currentY, 10, false, rgb(0, 0, 0), page);
      
      // Draw title in bold
      const titleLines = drawWrappedText(
        position.title, 
        tableX + col1Width + 5, 
        currentY, 
        descriptionMaxWidth, 
        10,
        true, // bold
        rgb(0, 0, 0),
        page
      );
      
      // Draw description below title (smaller font, not bold)
      const descriptionY = currentY - (titleLines * 12) - 2;
      const descriptionLines = drawWrappedText(
        position.description, 
        tableX + col1Width + 5, 
        descriptionY, 
        descriptionMaxWidth, 
        9,
        false, // not bold
        rgb(0, 0, 0),
        page
      );
      
      // Draw quantity, unit, and prices at the top of the row
      drawText(position.qty.toString(), tableX + col1Width + col2Width, currentY, 10, false, rgb(0, 0, 0), page);
      drawText(position.unit, tableX + col1Width + col2Width + col3Width, currentY, 10, false, rgb(0, 0, 0), page);
      
      // Right-align Einzelpreis
      const einzelpreisText = `${formatCurrency(position.price)} EUR`;
      const einzelpreisTextWidth = font.widthOfTextAtSize(einzelpreisText, 10);
      const einzelpreisX = tableX + col1Width + col2Width + col3Width + col4Width + col5Width - einzelpreisTextWidth;
      drawText(einzelpreisText, einzelpreisX, currentY, 10, false, rgb(0, 0, 0), page);
      
      // Right-align Gesamtpreis
      const gesamtpreisText = `${formatCurrency(positionTotal)} EUR`;
      const gesamtpreisTextWidth = font.widthOfTextAtSize(gesamtpreisText, 10);
      const gesamtpreisX = tableX + col1Width + col2Width + col3Width + col4Width + col5Width + col6Width - gesamtpreisTextWidth;
      drawText(gesamtpreisText, gesamtpreisX, currentY, 10, false, rgb(0, 0, 0), page);
      
      // Move to next row with dynamic spacing
      currentY -= rowHeight;
    });
  } else {
    // Default position if none provided
    const defaultTotal = 500;
    subtotal = defaultTotal;
    
    drawText('1', tableX, currentY, 10, false, rgb(0, 0, 0), page);
    
    // Draw title in bold
    drawText('Arbeitsleistung', tableX + col1Width + 5, currentY, 10, true, rgb(0, 0, 0), page);
    
    // Draw description below title
    drawText('Allgemeine Arbeitsleistung nach Vereinbarung', tableX + col1Width + 5, currentY - 12, 9, false, rgb(0, 0, 0), page);
    
    drawText('1', tableX + col1Width + col2Width, currentY, 10, false, rgb(0, 0, 0), page);
    drawText('Psch', tableX + col1Width + col2Width + col3Width, currentY, 10, false, rgb(0, 0, 0), page);
    
    // Right-align Einzelpreis
    const einzelpreisText = `${formatCurrency(500)} EUR`;
    const einzelpreisTextWidth = font.widthOfTextAtSize(einzelpreisText, 10);
    const einzelpreisX = tableX + col1Width + col2Width + col3Width + col4Width + col5Width - einzelpreisTextWidth;
    drawText(einzelpreisText, einzelpreisX, currentY, 10, false, rgb(0, 0, 0), page);
    
    // Right-align Gesamtpreis
    const gesamtpreisText = `${formatCurrency(500)} EUR`;
    const gesamtpreisTextWidth = font.widthOfTextAtSize(gesamtpreisText, 10);
    const gesamtpreisX = tableX + col1Width + col2Width + col3Width + col4Width + col5Width + col6Width - gesamtpreisTextWidth;
    drawText(gesamtpreisText, gesamtpreisX, currentY, 10, false, rgb(0, 0, 0), page);
    
    currentY -= 25;
  }

  // Totals section with full page width and proper spacing
  currentY -= 15; // Extra space before totals
  
  // Check if we need a new page for totals (need ~150px for totals + signature)
  if (currentY - 150 < minY) {
    page = createNewPage();
    // Content starts after header - start totals section below separator
    const offerY = (height - 120) - 80;
    currentY = offerY - 60; // Start totals section with some space below separator
  }
  
  // Define total section boundaries
  const totalSectionLeft = recipientX;
  const totalSectionRight = width - 40;
  const totalSectionWidth = totalSectionRight - totalSectionLeft;

  const excludeVAT = input.excludeVAT || false;
  
  // Subtotal - full width with proper spacing
  drawText('Zwischensumme:', totalSectionLeft, currentY, 10, true, rgb(0, 0, 0), page);
  const subtotalText = `${formatCurrency(subtotal)} EUR`;
  const subtotalTextWidth = fontBold.widthOfTextAtSize(subtotalText, 10);
  drawText(subtotalText, totalSectionRight - subtotalTextWidth, currentY, 10, true, rgb(0, 0, 0), page);
  
  currentY -= 20;
  
  if (excludeVAT) {
    // § 13b UStG - Keine MwSt., stattdessen Hinweistext
    const legalText = "Steuerschuldnerschaft des Leistungsempfängers gem. § 13b UStG";
    drawText(legalText, totalSectionLeft, currentY, 9, false, rgb(0, 0, 0), page);
    currentY -= 20;
    
    // Total = Subtotal (keine MwSt.)
    const total = subtotal;
    
    // Total with background - full width highlight
    page.drawRectangle({
      x: totalSectionLeft - 5,
      y: currentY - 5,
      width: totalSectionWidth + 10,
      height: 20,
      color: grayscale(0.95)
    });
    
    drawText('Gesamtbetrag:', totalSectionLeft, currentY, 12, true, rgb(0, 0, 0), page);
    const totalText = `${formatCurrency(total)} EUR`;
    const totalTextWidth = fontBold.widthOfTextAtSize(totalText, 12);
    drawText(totalText, totalSectionRight - totalTextWidth, currentY, 12, true, rgb(0, 0, 0), page);
  } else {
    // Normale Berechnung mit 19% MwSt.
    const vat = subtotal * 0.19;
    const total = subtotal + vat;
    
    // VAT - full width with proper spacing
    drawText('19% MwSt.:', totalSectionLeft, currentY, 10, true, rgb(0, 0, 0), page);
    const vatText = `${formatCurrency(vat)} EUR`;
    const vatTextWidth = fontBold.widthOfTextAtSize(vatText, 10);
    drawText(vatText, totalSectionRight - vatTextWidth, currentY, 10, true, rgb(0, 0, 0), page);
    
    currentY -= 20;
    
    // Total with background - full width highlight
    page.drawRectangle({
      x: totalSectionLeft - 5,
      y: currentY - 5,
      width: totalSectionWidth + 10,
      height: 20,
      color: grayscale(0.95)
    });
    
    drawText('Gesamtbetrag:', totalSectionLeft, currentY, 12, true, rgb(0, 0, 0), page);
    const totalText = `${formatCurrency(total)} EUR`;
    const totalTextWidth = fontBold.widthOfTextAtSize(totalText, 12);
    drawText(totalText, totalSectionRight - totalTextWidth, currentY, 12, true, rgb(0, 0, 0), page);
  }

  // Offer validity - Über dem Unterschriftsbereich
  currentY -= 30;
  const validityDays = input.offerValidityDays || 30;
  const validityText = `Dieses Angebot ist ${validityDays} Tage ab Ausstellungsdatum gültig. Nach Ablauf dieser Frist behalten wir uns vor, Preise und Leistungen anzupassen.`;
  const validityLines = drawWrappedText(validityText, recipientX, currentY, totalSectionWidth, 10, false, rgb(0, 0, 0), page);
  currentY -= (validityLines * 12) + 25; // Abstand nach Gültigkeitstext

  // Check if we need a new page for signature section (need ~180px)
  const signatureSectionHeight = 180;
  if (currentY - signatureSectionHeight < minY) {
    page = createNewPage();
    const offerY = (height - 120) - 80;
    currentY = offerY - 50; // Start signature section with some space below separator
  }

  // Signature section - Rechtsverbindliche Unterschriften
  const signatureSectionLeft = recipientX;
  const signatureSectionRight = width - 40;
  const signatureSectionWidth = signatureSectionRight - signatureSectionLeft;
  
  // Explanation text above signature lines
  const explanationText = 'Mit der Unterschrift bestätigen beide Parteien die Annahme und Verbindlichkeit dieses Angebots.';
  const explanationLines = drawWrappedText(explanationText, signatureSectionLeft, currentY, signatureSectionWidth, 9, false, rgb(0, 0, 0), page);
  currentY -= (explanationLines * 11) + 25; // Abstand nach Erklärungstext

  // Signature lines - two columns side by side
  const signatureLineWidth = (signatureSectionWidth - 20) / 2; // Half width minus spacing
  const signatureLineHeight = 40; // Height for signature line
  const lineThickness = 1;
  const labelOffset = 8; // Space between line and label (below line)
  const labelFontSize = 7; // Smaller font size for labels
  const rightColumnX = signatureSectionLeft + signatureLineWidth + 20; // Right column X position

  // First row - Ort, Datum (left) and Unterschrift Kunde (right)
  const firstRowLineY = currentY;
  
  // Left column - Ort, Datum
  drawLine(
    signatureSectionLeft,
    firstRowLineY,
    signatureSectionLeft + signatureLineWidth,
    firstRowLineY,
    lineThickness,
    page
  );
  // Label below line
  drawText('Ort, Datum', signatureSectionLeft, firstRowLineY - labelOffset, labelFontSize, false, rgb(0, 0, 0), page);

  // Right column - Unterschrift Kunde
  drawLine(
    rightColumnX,
    firstRowLineY,
    rightColumnX + signatureLineWidth,
    firstRowLineY,
    lineThickness,
    page
  );
  // Label below line
  drawText('Unterschrift Kunde', rightColumnX, firstRowLineY - labelOffset, labelFontSize, false, rgb(0, 0, 0), page);

  // Second row - Unterschrift Handwerker (left only, no right column)
  const secondRowLineY = firstRowLineY - signatureLineHeight - 25; // Space between rows
  
  // Left column - Unterschrift Handwerker
  drawLine(
    signatureSectionLeft,
    secondRowLineY,
    signatureSectionLeft + signatureLineWidth,
    secondRowLineY,
    lineThickness,
    page
  );
  // Label below line
  drawText('Unterschrift Handwerker', signatureSectionLeft, secondRowLineY - labelOffset, labelFontSize, false, rgb(0, 0, 0), page);

  currentY = secondRowLineY - 30; // Space after signature section

  // Signature - Grußformel nach dem Unterschriftsbereich
  drawText('Mit freundlichen Grüßen', recipientX, currentY, 11, false, rgb(0, 0, 0), page);
  drawText(input.company && isValidText(input.company.name) ? input.company.name : 'AngebotNow', recipientX, currentY - 20, 11, true, rgb(0, 0, 0), page);

  // Add page numbers to all pages
  const totalPages = pages.length;
  pages.forEach((p, index) => {
    drawFooter(p, index + 1, totalPages);
  });

  return await pdfDoc.save();
}
