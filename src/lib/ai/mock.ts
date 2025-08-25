import { AIInput, AIResult } from './provider';

export async function processWithMockAI(input: AIInput): Promise<AIResult> {
  return {
    description: `Analyse (Mock): ${input.projectInfo}`,
    positions: [
      { title: 'Fliesenlegen', qty: 38, unit: 'm²', price: 37 },
      { title: 'Entsorgung', qty: 1, unit: 'Psch', price: 350 },
    ],
    total: 1746,
  };
}
