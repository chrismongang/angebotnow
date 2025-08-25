import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export type QuotePosition = { title: string; qty: number; unit: string; price: number };
export type GeneratePDFInput = {
  clientName: string;
  projectInfo: string;
  positions?: QuotePosition[];
  total?: number;
  quoteNumber?: string;
  company?: { name?: string; address?: string; email?: string; phone?: string };
};

export async function generatePDF(input: GeneratePDFInput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const drawText = (text: string, x: number, y: number, size = 11, bold = false) => {
    page.drawText(text, { x, y, size, font: bold ? fontBold : font, color: rgb(0, 0, 0) });
  };

  drawText('AngebotNow', 40, 800, 18, true);
  drawText('Angebot', 40, 778, 14, true);
  if (input.quoteNumber) drawText(`#${input.quoteNumber}`, 100, 778, 12);

  if (input.company) {
    const y = 800; const x = width - 250;
    if (input.company.name)    drawText(input.company.name,    x, y, 11, true);
    if (input.company.address) drawText(input.company.address, x, y - 16);
    if (input.company.email)   drawText(input.company.email,   x, y - 32);
    if (input.company.phone)   drawText(input.company.phone,   x, y - 48);
  }

  drawText(`Kunde: ${input.clientName}`, 40, 740, 11);
  drawText('Projekt:', 40, 720, 11, true);

  const wrap = (text: string, max = 95) => {
    const words = text.split(' ');
    const lines: string[] = []; let line = '';
    for (const w of words) {
      const t = (line + ' ' + w).trim();
      if (t.length > max) { lines.push(line); line = w; } else { line = t; }
    }
    if (line) lines.push(line);
    return lines;
  };

  let y = 705;
  wrap(input.projectInfo || '', 95).forEach(l => { drawText(l, 40, y, 11); y -= 14; });

  y -= 10;
  if (input.positions?.length) {
    drawText('Positionen', 40, y, 12, true); y -= 20;
    input.positions.forEach(p => { drawText(`${p.title} — ${p.qty} ${p.unit} × ${p.price.toFixed(2)} €`, 40, y, 11); y -= 14; });
  }

  if (typeof input.total === 'number') {
    y -= 10;
    drawText(`Gesamtsumme: ${input.total.toFixed(2)} €`, 40, y, 12, true);
  }

  return await pdfDoc.save();
}
