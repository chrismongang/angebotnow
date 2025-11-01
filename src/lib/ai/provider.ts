export type AIInput = { 
  projectInfo: string; 
  imageUrl?: string; 
  clientCity?: string;
  // NEU: Erweiterte Bildanalyse-Optionen
  imageAnalysisMode?: 'basic' | 'detailed' | 'comprehensive';
  includeImageAnalysis?: boolean;
};

export type AIResult = { 
  description: string; 
  positions: Array<{ 
    title: string; 
    description: string; 
    qty: number; 
    unit: string; 
    price: number 
  }>; 
  total?: number;
  // NEU: Bildanalyse-Ergebnisse (im Hintergrund)
  imageAnalysis?: {
    detectedElements: string[];
    projectType: string;
    complexity: number;
    confidence: number;
    recommendations: string[];
  };
};

export const USE_OPENAI = process.env.USE_OPENAI === 'true';
