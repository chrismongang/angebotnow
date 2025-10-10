import { PDFDocument, StandardFonts, rgb, grayscale } from 'pdf-lib';

export type QuotePosition = { title: string; qty: number; unit: string; price: number };
export type GeneratePDFInput = {
  clientName: string;
  projectInfo: string;
  positions?: QuotePosition[];
  total?: number;
  quoteNumber?: string;
  clientStreet?: string;
  clientCity?: string;
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
  };
  userSubscriptionTier?: 'FREE' | 'PRO';
};

export async function generatePDF(input: GeneratePDFInput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const drawText = (text: string, x: number, y: number, size = 11, bold = false, color: any = rgb(0, 0, 0)) => {
    page.drawText(text, { x, y, size, font: bold ? fontBold : font, color });
  };

  // Function to wrap text to fit within a specified width
  const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
    const words = text.split(' ');
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
    
    return lines;
  };

  // Function to draw wrapped text
  const drawWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number, bold = false, color: any = rgb(0, 0, 0)) => {
    const lines = wrapText(text, maxWidth, fontSize);
    lines.forEach((line, index) => {
      page.drawText(line, { 
        x, 
        y: y - (index * (fontSize + 2)), 
        size: fontSize, 
        font: bold ? fontBold : font, 
        color 
      });
    });
    return lines.length; // Return number of lines for spacing calculation
  };

  const drawLine = (x1: number, y1: number, x2: number, y2: number, thickness = 1) => {
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness,
      color: grayscale(0.8)
    });
  };

  // Branding left side (AngebotNow + Tagline) - Only show for Free users
  const shouldShowBranding = input.userSubscriptionTier !== 'PRO';
  
  if (shouldShowBranding) {
    const brandingX = 40;
    const brandingY = height - 40;
    drawText('AngebotNow', brandingX, brandingY, 18, true, rgb(0.973, 0.596, 0.075)); // Orange color
    drawText('Professionelle Angebotserstellung', brandingX, brandingY - 20, 10, false, grayscale(0.5));
  }

  // Sender information (top right)
  const senderX = width - 200;
  const senderY = height - 80;
  
  // Helper function to check if a value is meaningful
  const isValidText = (text: string | undefined | null): text is string => {
    return Boolean(text && text.trim().length > 0)
  }
  
  if (input.company && isValidText(input.company.name)) drawText(input.company.name, senderX, senderY, 12, true);
  if (input.company && isValidText(input.company.address)) {
    const addressLines = input.company.address.split('\n');
    addressLines.forEach((line, index) => {
      if (isValidText(line)) {
        drawText(line, senderX, senderY - 16 - (index * 16), 10);
      }
    });
  }
  if (input.company && isValidText(input.company.email)) drawText(`${input.company.email}`, senderX, senderY - 48, 10);
  if (input.company && isValidText(input.company.phone)) drawText(`Tel.: ${input.company.phone}`, senderX, senderY - 64, 10);

  // Recipient information (top left, below branding)
  const recipientX = 40;
  const recipientY = height - 120; // More space below branding
  
  // Sender address for window envelope (light gray)
  if (input.company && isValidText(input.company.name) && isValidText(input.company.address)) {
    const senderAddress = `${input.company.name} - ${input.company.address.replace('\n', ' ')}`;
    drawText(senderAddress, recipientX, recipientY + 20, 10, false, grayscale(0.5));
  }
  
  drawText(input.clientName, recipientX, recipientY, 12, true);
  
  // Client address (if provided)
  if (input.clientStreet || input.clientCity) {
    const clientAddress = [input.clientStreet, input.clientCity].filter(Boolean).join('\n');
    const addressLines = clientAddress.split('\n');
    addressLines.forEach((line, index) => {
      drawText(line, recipientX, recipientY - 16 - (index * 16), 10);
    });
  }

  // Offer details section
  const offerY = recipientY - 80;
  
  // Main title "Angebot"
  drawText('Angebot', recipientX, offerY, 16, true);
  
  // Offer number and date
  const currentDate = new Date().toLocaleDateString('de-DE');
  const offerNumber = input.quoteNumber || 'DEMO';
  
  drawText(`Angebot-Nr.: ${offerNumber}`, recipientX, offerY - 20, 10);
  drawText(`Datum: ${currentDate}`, senderX, offerY - 20, 10);

  // Separator line
  drawLine(recipientX, offerY - 40, width - 40, offerY - 40);

  // Salutation
  const salutationY = offerY - 70;
  
  // Project summary only (no greeting or introduction text)
  const projectSummary = input.projectInfo || 'Arbeitsleistung';
  drawText(projectSummary, recipientX, salutationY, 11);

  // Positions table
  const tableY = salutationY - 30; // Reduced space since we removed greeting
  const tableX = recipientX;
  const col1Width = 40;   // Pos
  const col2Width = 200;  // Bezeichnung
  const col3Width = 60;   // Menge
  const col4Width = 60;   // Einheit
  const col5Width = 80;   // Einzelpreis
  const col6Width = 80;   // Gesamtpreis

  // Table header with background
  page.drawRectangle({
    x: tableX - 5,
    y: tableY - 5,
    width: col1Width + col2Width + col3Width + col4Width + col5Width + col6Width + 10,
    height: 20,
    color: grayscale(0.95)
  });

  drawText('Pos', tableX, tableY, 10, true);
  drawText('Bezeichnung', tableX + col1Width, tableY, 10, true);
  drawText('Menge', tableX + col1Width + col2Width, tableY, 10, true);
  drawText('Einheit', tableX + col1Width + col2Width + col3Width, tableY, 10, true);
  drawText('Einzelpreis', tableX + col1Width + col2Width + col3Width + col4Width, tableY, 10, true);
  drawText('Gesamtpreis', tableX + col1Width + col2Width + col3Width + col4Width + col5Width, tableY, 10, true);

  // Table rows
  let currentY = tableY - 25;
  let subtotal = 0;

  if (input.positions && input.positions.length > 0) {
    input.positions.forEach((position, index) => {
      const positionTotal = position.qty * position.price;
      subtotal += positionTotal;
      
      // Calculate available width for description (with some padding)
      const descriptionMaxWidth = col2Width - 10;
      
      // Draw position number
      drawText((index + 1).toString(), tableX, currentY, 10);
      
      // Draw wrapped description text
      const descriptionLines = drawWrappedText(
        position.title, 
        tableX + col1Width + 5, 
        currentY, 
        descriptionMaxWidth, 
        10
      );
      
      // Calculate row height based on description lines
      const rowHeight = Math.max(20, descriptionLines * 12);
      
      // Draw quantity, unit, and prices at the top of the row
      drawText(position.qty.toString(), tableX + col1Width + col2Width, currentY, 10);
      drawText(position.unit, tableX + col1Width + col2Width + col3Width, currentY, 10);
      
      // Right-align Einzelpreis
      const einzelpreisText = `${position.price.toFixed(2)} EUR`;
      const einzelpreisTextWidth = font.widthOfTextAtSize(einzelpreisText, 10);
      const einzelpreisX = tableX + col1Width + col2Width + col3Width + col4Width + col5Width - einzelpreisTextWidth;
      drawText(einzelpreisText, einzelpreisX, currentY, 10);
      
      // Right-align Gesamtpreis
      const gesamtpreisText = `${positionTotal.toFixed(2)} EUR`;
      const gesamtpreisTextWidth = font.widthOfTextAtSize(gesamtpreisText, 10);
      const gesamtpreisX = tableX + col1Width + col2Width + col3Width + col4Width + col5Width + col6Width - gesamtpreisTextWidth;
      drawText(gesamtpreisText, gesamtpreisX, currentY, 10);
      
      // Move to next row with dynamic spacing
      currentY -= rowHeight;
    });
  } else {
    // Default position if none provided
    const defaultTotal = 500;
    subtotal = defaultTotal;
    
    drawText('1', tableX, currentY, 10);
    drawText('Arbeitsleistung', tableX + col1Width, currentY, 10);
    drawText('1', tableX + col1Width + col2Width, currentY, 10);
    drawText('Psch', tableX + col1Width + col2Width + col3Width, currentY, 10);
    
    // Right-align Einzelpreis
    const einzelpreisText = '500,00 EUR';
    const einzelpreisTextWidth = font.widthOfTextAtSize(einzelpreisText, 10);
    const einzelpreisX = tableX + col1Width + col2Width + col3Width + col4Width + col5Width - einzelpreisTextWidth;
    drawText(einzelpreisText, einzelpreisX, currentY, 10);
    
    // Right-align Gesamtpreis
    const gesamtpreisText = '500,00 EUR';
    const gesamtpreisTextWidth = font.widthOfTextAtSize(gesamtpreisText, 10);
    const gesamtpreisX = tableX + col1Width + col2Width + col3Width + col4Width + col5Width + col6Width - gesamtpreisTextWidth;
    drawText(gesamtpreisText, gesamtpreisX, currentY, 10);
    
    currentY -= 20;
  }

  // Totals section with full page width and proper spacing
  currentY -= 15; // Extra space before totals
  
  const vat = subtotal * 0.19;
  const total = subtotal + vat;

  // Define total section boundaries
  const totalSectionLeft = recipientX;
  const totalSectionRight = width - 40;
  const totalSectionWidth = totalSectionRight - totalSectionLeft;

  // Subtotal - full width with proper spacing
  drawText('Zwischensumme:', totalSectionLeft, currentY, 10, true);
  const subtotalText = `${subtotal.toFixed(2)} EUR`;
  const subtotalTextWidth = fontBold.widthOfTextAtSize(subtotalText, 10);
  drawText(subtotalText, totalSectionRight - subtotalTextWidth, currentY, 10, true);
  
  currentY -= 20;
  
  // VAT - full width with proper spacing
  drawText('19% MwSt.:', totalSectionLeft, currentY, 10, true);
  const vatText = `${vat.toFixed(2)} EUR`;
  const vatTextWidth = fontBold.widthOfTextAtSize(vatText, 10);
  drawText(vatText, totalSectionRight - vatTextWidth, currentY, 10, true);
  
  currentY -= 20;
  
  // Total with background - full width highlight
  page.drawRectangle({
    x: totalSectionLeft - 5,
    y: currentY - 5,
    width: totalSectionWidth + 10,
    height: 20,
    color: grayscale(0.95)
  });
  
  drawText('Gesamtbetrag:', totalSectionLeft, currentY, 12, true);
  const totalText = `${total.toFixed(2)} EUR`;
  const totalTextWidth = fontBold.widthOfTextAtSize(totalText, 12);
  drawText(totalText, totalSectionRight - totalTextWidth, currentY, 12, true);

  // Closing remarks - Entfernt den unerwünschten Text
  const closingY = currentY - 60;
  // drawText('Ist unser Angebot für Sie interessant? Dann freuen wir uns über Ihren Auftrag!', recipientX, closingY, 10);
  // drawText('Zögern Sie bitte nicht, uns bei Fragen zu kontaktieren.', recipientX, closingY - 16, 10);
  
  // if (input.company && isValidText(input.company.phone)) {
  //   drawText(`Sie erreichen uns jederzeit unter der Telefonnummer: ${input.company.phone}`, recipientX, closingY - 32, 10);
  // }

  // Signature - Direkt nach den Totals
  const signatureY = currentY - 40; // Reduzierter Abstand da Text entfernt wurde
  drawText('Mit freundlichen Grüßen', recipientX, signatureY, 11);
  drawText(input.company && isValidText(input.company.name) ? input.company.name : 'AngebotNow', recipientX, signatureY - 20, 11, true);

  // Footer
  const footerY = 80;
  drawLine(recipientX, footerY + 20, width - 40, footerY + 20);
  
  // Footer in three columns
  const footerCol1X = recipientX;
  const footerCol2X = width / 2 - 80;
  const footerCol3X = width - 200;
  
  // Column 1 - Company details
  if (input.company && isValidText(input.company.name)) drawText(input.company.name, footerCol1X, footerY, 8);
  if (input.company && isValidText(input.company.address)) {
    const addressLines = input.company.address.split('\n');
    addressLines.forEach((line, index) => {
      if (isValidText(line)) {
        drawText(line, footerCol1X, footerY - 12 - (index * 12), 8);
      }
    });
  }
  if (input.company && isValidText(input.company.email)) drawText(`E-Mail: ${input.company.email}`, footerCol1X, footerY - 48, 8);
  if (input.company && isValidText(input.company.phone)) drawText(`Tel: ${input.company.phone}`, footerCol1X, footerY - 60, 8);
  
  // Column 2 - Bank details
  if (input.company && isValidText(input.company.bankName)) drawText(`Kreditinstitut: ${input.company.bankName}`, footerCol2X, footerY, 8);
  if (input.company && isValidText(input.company.bankAccount)) drawText(`IBAN: ${input.company.bankAccount}`, footerCol2X, footerY - 12, 8);
  if (input.company && isValidText(input.company.bankBic)) drawText(`BIC: ${input.company.bankBic}`, footerCol2X, footerY - 24, 8);
  
  // Column 3 - Legal info
  if (input.company && isValidText(input.company.vatNumber)) drawText(`USt-ID: ${input.company.vatNumber}`, footerCol3X, footerY, 8);
  if (input.company && isValidText(input.company.taxNumber)) drawText(`Steuer-Nr.: ${input.company.taxNumber}`, footerCol3X, footerY - 12, 8);
  if (input.company && isValidText(input.company.taxOffice)) drawText(input.company.taxOffice, footerCol3X, footerY - 24, 8);

  return await pdfDoc.save();
}
