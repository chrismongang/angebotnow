export type AIInput = { projectInfo: string; imageUrl?: string };
export type AIResult = { description: string; positions: Array<{ title: string; qty: number; unit: string; price: number }>; total?: number };

export const USE_OPENAI = process.env.USE_OPENAI === 'true';
