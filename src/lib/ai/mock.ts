import { AIInput, AIResult } from './provider';

export async function processWithMockAI(input: AIInput): Promise<AIResult> {
  // Adjust prices based on city if provided
  let priceMultiplier = 1.0;
  if (input.clientCity) {
    // Higher prices for major cities
    if (input.clientCity.includes('München') || input.clientCity.includes('Hamburg') || input.clientCity.includes('Frankfurt')) {
      priceMultiplier = 1.3;
    } else if (input.clientCity.includes('Berlin') || input.clientCity.includes('Köln') || input.clientCity.includes('Düsseldorf')) {
      priceMultiplier = 1.2;
    } else if (input.clientCity.includes('Nürnberg') || input.clientCity.includes('Stuttgart')) {
      priceMultiplier = 1.1;
    }
  }

  return {
    description: `Analyse (Mock): ${input.projectInfo}${input.clientCity ? ` - Standort: ${input.clientCity}` : ''}`,
    positions: [
      { title: 'Fliesenlegen', qty: 38, unit: 'm²', price: Math.round(37 * priceMultiplier) },
      { title: 'Entsorgung', qty: 1, unit: 'Psch', price: Math.round(350 * priceMultiplier) },
    ],
    total: Math.round(1746 * priceMultiplier),
  };
}
