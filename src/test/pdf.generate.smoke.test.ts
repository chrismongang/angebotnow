import { describe, it, expect } from 'vitest';
import { generatePDF } from '../lib/pdf/generate';

describe('PDF Generation Smoke Test', () => {
  it('should generate a valid PDF with test data', async () => {
    const testData = {
      clientName: 'Test Kunde GmbH',
      projectInfo: 'Badrenovierung mit Fliesenarbeiten und Entsorgung',
      positions: [
        { title: 'Fliesenlegen', qty: 38, unit: 'm²', price: 37 },
        { title: 'Entsorgung', qty: 1, unit: 'Psch', price: 350 },
        { title: 'Materialkosten', qty: 1, unit: 'Psch', price: 200 },
      ],
      total: 1746,
      quoteNumber: 'TEST-001',
      company: {
        name: 'AngebotNow GmbH',
        address: 'Musterstraße 123, 12345 Musterstadt',
        email: 'info@angebotnow.de',
        phone: '+49 123 456789',
      },
    };

    const pdfBytes = await generatePDF(testData);

    // Basic validation
    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(1000); // PDF should be reasonably sized
    
    // Check PDF header (should start with %PDF)
    const header = new TextDecoder().decode(pdfBytes.slice(0, 4));
    expect(header).toBe('%PDF');
    
    console.log(`✅ PDF generated successfully: ${pdfBytes.length} bytes`);
  });

  it('should handle minimal data without errors', async () => {
    const minimalData = {
      clientName: 'Minimal Test',
      projectInfo: 'Simple project',
    };

    const pdfBytes = await generatePDF(minimalData);

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(1000);
    
    console.log(`✅ Minimal PDF generated: ${pdfBytes.length} bytes`);
  });
});
