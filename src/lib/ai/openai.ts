import OpenAI from 'openai';
import { AIInput, AIResult } from './provider';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to clean and fix JSON
function cleanAndParseJSON(text: string): any {
  try {
    // First, try to parse as-is
    return JSON.parse(text);
  } catch (error) {
    console.log('Initial JSON parse failed, attempting to clean...');
    
    // Try to extract JSON from the response
    let cleanedText = text.trim();
    
    // Remove any text before the first {
    const firstBrace = cleanedText.indexOf('{');
    if (firstBrace > 0) {
      cleanedText = cleanedText.substring(firstBrace);
    }
    
    // Remove any text after the last }
    const lastBrace = cleanedText.lastIndexOf('}');
    if (lastBrace > 0 && lastBrace < cleanedText.length - 1) {
      cleanedText = cleanedText.substring(0, lastBrace + 1);
    }
    
    // Try to fix common JSON issues
    cleanedText = cleanedText
      .replace(/,\s*}/g, '}') // Remove trailing commas
      .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\r/g, '') // Remove carriage returns
      .replace(/\t/g, ' ') // Replace tabs with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    try {
      return JSON.parse(cleanedText);
    } catch (secondError) {
      console.log('Cleaned JSON parse also failed:', secondError);
      console.log('Cleaned text was:', cleanedText);
      return null;
    }
  }
}

export async function processWithOpenAI(input: AIInput): Promise<AIResult> {
  try {
    const systemPrompt = `Du bist ein erfahrener Handwerksmeister mit über 20 Jahren Erfahrung in der Angebotserstellung. Du kennst die aktuellen Marktpreise, Materialkosten und Arbeitszeiten für verschiedene Gewerke in Deutschland.

WICHTIG: Antworte NUR mit einem gültigen JSON-Objekt. Keine zusätzlichen Texte oder Erklärungen.

BILDANALYSE:
- Analysiere das hochgeladene Bild detailliert
- Erkenne Materialien, Oberflächen, Zustand
- Schätze Projektumfang und Komplexität
- Identifiziere potenzielle Herausforderungen
- Erkenne Gewerke-spezifische Arbeiten

PREISKALKULATION:
- Berücksichtige aktuelle Materialpreise (2024/2025)
- Kalkuliere realistische Arbeitszeiten basierend auf Projektumfang
- Verwende regionale Preise für ${input.clientCity ? input.clientCity : 'Deutschland'}
- Berücksichtige Gewerke-spezifische Preise:
  * Malerarbeiten: 35-60€/Std
  * Fliesenleger: 35-70€/Std
  * Sanitär: 40-60€/Std
  * Elektriker: 45-65€/Std
  * Schreiner: 40-60€/Std
  * Gartenbau: 30-50€/Std

MATERIALKALKULATION:
- Verwende realistische Materialmengen (m², lfm, Stück)
- Berücksichtige Verschnitt und Abfall (10-15%)
- Kalkuliere Materialpreise pro Einheit
- Füge notwendige Hilfsstoffe hinzu (Kleber, Dichtmasse, etc.)

ARBEITSZEITEN:
- Kalkuliere realistische Arbeitszeiten
- Berücksichtige Vorbereitung, Hauptarbeit und Nacharbeit
- Plane Puffer für unvorhergesehene Arbeiten (10-20%)

EINHEITEN:
- Verwende korrekte Einheiten: m², lfm, Stück, Std, Psch (Pauschal)
- Psch nur für kleine, definierte Arbeiten
- Mengenangaben müssen realistisch sein

Erstelle eine kurze, prägnante Projektzusammenfassung (max. 100 Zeichen) für die Einleitung des Angebots.

JSON-Format:
{
  "description": "Kurze Projektzusammenfassung für die Einleitung",
  "positions": [
    {
      "title": "Detaillierte Beschreibung der Position",
      "qty": 1,
      "unit": "Einheit (m², lfm, Stück, Std, Psch)",
      "price": 100.00
    }
  ],
  "total": 500.00,
  "imageAnalysis": {
    "detectedElements": ["Fliesen", "Sanitäranlagen", "Wasseranschlüsse"],
    "projectType": "Badezimmer-Sanierung",
    "complexity": 7,
    "confidence": 85,
    "recommendations": ["Entfernung alter Fliesen erforderlich", "Wasseranschlüsse prüfen"]
  }
}

BEISPIEL FÜR BADEZIMMER-SANIERUNG:
{
  "description": "Komplette Badezimmer-Sanierung mit neuen Fliesen",
  "positions": [
    {
      "title": "Entfernung alter Fliesen und Estrich",
      "qty": 12,
      "unit": "m²",
      "price": 25.00
    },
    {
      "title": "Fliesenarbeiten Wand - hochwertige Fliesen",
      "qty": 18,
      "unit": "m²",
      "price": 45.00
    },
    {
      "title": "Fliesenarbeiten Boden - rutschfeste Fliesen",
      "qty": 6,
      "unit": "m²",
      "price": 42.00
    },
    {
      "title": "Fugenmörtel und Silikon",
      "qty": 24,
      "unit": "m²",
      "price": 8.00
    },
    {
      "title": "WC-Installation komplett",
      "qty": 1,
      "unit": "Stück",
      "price": 280.00
    },
    {
      "title": "Waschbecken mit Armatur",
      "qty": 1,
      "unit": "Stück",
      "price": 320.00
    },
    {
      "title": "Dusche komplett mit Ablauf",
      "qty": 1,
      "unit": "Stück",
      "price": 450.00
    },
    {
      "title": "Entsorgung Altmaterial",
      "qty": 1,
      "unit": "Psch",
      "price": 180.00
    }
  ],
  "total": 2846.00
}

BEISPIEL FÜR MALERARBEITEN:
{
  "description": "Wohnzimmer-Renovierung - Malerarbeiten",
  "positions": [
    {
      "title": "Wandfarbe Premium - 2 Anstriche",
      "qty": 35,
      "unit": "m²",
      "price": 12.50
    },
    {
      "title": "Deckenfarbe - 2 Anstriche",
      "qty": 20,
      "unit": "m²",
      "price": 10.00
    },
    {
      "title": "Türrahmen lackieren",
      "qty": 3,
      "unit": "Stück",
      "price": 45.00
    },
    {
      "title": "Fensterbank streichen",
      "qty": 2,
      "unit": "Stück",
      "price": 35.00
    },
    {
      "title": "Möblierung und Schutz",
      "qty": 1,
      "unit": "Psch",
      "price": 120.00
    }
  ],
  "total": 795.00
}`;

    const userPrompt = `PROJEKTANALYSE:
Projektinformationen: ${input.projectInfo}
${input.clientCity ? `Standort: ${input.clientCity} (regionale Preise berücksichtigen)` : 'Standort: Deutschland (Standard-Preise)'}

AUFGABE:
Erstelle ein detailliertes, professionelles Angebot basierend auf den Projektinformationen und der Bildanalyse.
${input.clientCity ? `Berücksichtige dabei die lokalen Marktpreise für ${input.clientCity}.` : ''}

WICHTIG:
- Analysiere das Bild detailliert für Materialien und Zustand
- Verwende realistische Materialmengen und Arbeitszeiten
- Kalkuliere korrekte Einzelpreise pro Position
- Berücksichtige alle notwendigen Materialien und Arbeiten
- Erstelle eine präzise Gesamtsumme`;

    // NEU: Vision API Integration
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    // Bild hinzufügen wenn verfügbar
    if (input.imageUrl && input.includeImageAnalysis !== false) {
      messages[1] = {
        role: 'user',
        content: [
          { type: 'text', text: userPrompt },
          { 
            type: 'image_url', 
            image_url: { 
              url: input.imageUrl,
              detail: input.imageAnalysisMode === 'detailed' ? 'high' : 'auto'
            } 
          }
        ]
      };
    }

    const response = await client.chat.completions.create({
      model: 'gpt-4o', // NEU: Vision-fähiges Modell
      messages,
      max_tokens: 2500, // Erhöht für detailliertere Analyse (+25% für bessere Qualität)
      response_format: { type: "json_object" }
    });

    const text = response.choices[0]?.message?.content;
    console.log('Raw AI response with image analysis:', text);

    if (!text) {
      throw new Error('No response from OpenAI');
    }

    // Use the robust JSON parsing function
    const parsedData = cleanAndParseJSON(text);

    if (!parsedData) {
      console.error('Failed to parse AI response after cleaning attempts');
      return {
        description: input.projectInfo || 'Arbeitsleistung',
        positions: [
          { title: 'Arbeitsleistung', qty: 1, unit: 'Psch', price: 500 }
        ],
        total: 500
      };
    }

    // NEU: Erweiterte Validierung mit Bildanalyse
    const validPositions = parsedData.positions?.filter((pos: any) => 
      pos.title && typeof pos.qty === 'number' && pos.unit && typeof pos.price === 'number'
    ) || [];

    if (validPositions.length === 0) {
      console.error('No valid positions found in AI response');
      return {
        description: input.projectInfo || 'Arbeitsleistung',
        positions: [
          { title: 'Arbeitsleistung', qty: 1, unit: 'Psch', price: 500 }
        ],
        total: 500
      };
    }

    // Calculate total if not provided or invalid
    let total = parsedData.total;
    if (typeof total !== 'number' || isNaN(total) || total <= 0) {
      total = validPositions.reduce((sum: number, pos: any) => sum + (pos.qty * pos.price), 0);
    }

    // Double-check: if total seems wrong, recalculate from positions
    const calculatedTotal = validPositions.reduce((sum: number, pos: any) => sum + (pos.qty * pos.price), 0);
    if (Math.abs(total - calculatedTotal) > 1) { // Allow for small rounding differences
      console.log('Total mismatch detected, recalculating from positions');
      total = calculatedTotal;
    }

    // NEU: Bildanalyse-Ergebnisse hinzufügen
    const result: AIResult = {
      description: parsedData.description || input.projectInfo || 'Arbeitsleistung',
      positions: validPositions,
      total: total,
      imageAnalysis: parsedData.imageAnalysis || undefined
    };

    console.log('AI processing completed with image analysis:', result);
    return result;

  } catch (error) {
    console.error('Error processing with OpenAI:', error);
    // Fallback to mock data
    return {
      description: input.projectInfo || 'Arbeitsleistung',
      positions: [
        { title: 'Arbeitsleistung', qty: 1, unit: 'Psch', price: 500 }
      ],
      total: 500
    };
  }
}