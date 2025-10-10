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

POSITIONSBESCHREIBUNGEN:
- Verwende präzise Fachterminologie für das jeweilige Gewerk
- Beschreibe den Leistungsumfang klar und verständlich
- Erwähne wesentliche Materialien und Standards wo sinnvoll
- Formuliere professionell im Stil von VOB/BGB-Verträgen
- Strukturiere komplexe Positionen mit aussagekräftigen Details
- Beispiele guter Formulierungen:
  * Statt: "Wände streichen"
  → "Wandflächen grundieren und 2-fach deckend streichen mit Dispersionsfarbe matt"
  * Statt: "Fliesen verlegen"
  → "Bodenfliesen verlegen im Dickbettverfahren, inkl. Grundierung und Verfugung"
  * Statt: "Sanitär installieren"
  → "WC-Anlage demontieren und entsorgen, neue wandhängende WC-Keramik montieren inkl. Unterputz-Spülkasten"

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
  "description": "Komplette Badezimmer-Sanierung mit Fliesenarbeiten und Sanitärinstallation",
  "positions": [
    {
      "title": "Rückbau und Entsorgung alter Wandfliesen inkl. Putzträger, fachgerechte Entsorgung des Abbruchmaterials",
      "qty": 18,
      "unit": "m²",
      "price": 28.00
    },
    {
      "title": "Rückbau Bodenfliesen inkl. Estrichschicht bis 3cm Stärke, Untergrund vorbereiten und ebnen",
      "qty": 6,
      "unit": "m²",
      "price": 32.00
    },
    {
      "title": "Wandfliesenarbeiten im Dünnbettverfahren, großformatige Feinsteinzeugfliesen 30x60cm, inkl. Grundierung",
      "qty": 18,
      "unit": "m²",
      "price": 55.00
    },
    {
      "title": "Bodenfliesenarbeiten mit rutschfesten Fliesen R10/B, Verlegung im Dünnbettverfahren inkl. Gefälleausbildung",
      "qty": 6,
      "unit": "m²",
      "price": 48.00
    },
    {
      "title": "Verfugung aller Fliesenflächen mit wasserabweisender Fugenmasse, Silikonfugen an Wandanschlüssen",
      "qty": 24,
      "unit": "m²",
      "price": 9.50
    },
    {
      "title": "Demontage alte WC-Anlage, Installation wandhängendes WC komplett mit Unterputz-Spülkasten und Drückerplatte, Anschluss an Abwasserleitung",
      "qty": 1,
      "unit": "Stück",
      "price": 380.00
    },
    {
      "title": "Waschtisch-Kombination montieren inkl. Unterschrank, Keramik-Einbauwaschtisch 80cm, Einhebel-Waschtischarmatur, Anschluss an Kalt- und Warmwasser",
      "qty": 1,
      "unit": "Stück",
      "price": 420.00
    },
    {
      "title": "Bodenebene Duschfläche einbauen 90x120cm inkl. Ablaufrinne, Duschabtrennung aus ESG-Glas 8mm, inkl. aller Dichtarbeiten",
      "qty": 1,
      "unit": "Stück",
      "price": 580.00
    },
    {
      "title": "Container-Gestellung und fachgerechte Entsorgung aller Abbruchmaterialien, Fliesen, Keramik und Bauschutt",
      "qty": 1,
      "unit": "Psch",
      "price": 220.00
    }
  ],
  "total": 3531.00
}

BEISPIEL FÜR MALERARBEITEN:
{
  "description": "Umfassende Renovierung Wohnzimmer - Malerarbeiten in Premiumqualität",
  "positions": [
    {
      "title": "Wandflächen grundieren mit Tiefengrund, anschließend 2-fach deckend streichen mit Dispersionsfarbe matt (Deckkraftklasse 1), inkl. Abkleben und Abdeckarbeiten",
      "qty": 35,
      "unit": "m²",
      "price": 15.00
    },
    {
      "title": "Deckenflächen vorbereiten, grundieren und 2-fach deckend streichen mit Dispersionsdeckenfarbe weiß matt, tropfgehemmt",
      "qty": 20,
      "unit": "m²",
      "price": 12.50
    },
    {
      "title": "Türrahmen und Türblätter schleifen, grundieren und 2-fach lackieren mit Acryllack seidenmatt weiß, inkl. Demontage/Montage Türbeschläge",
      "qty": 3,
      "unit": "Stück",
      "price": 65.00
    },
    {
      "title": "Fensterbank innen abschleifen, grundieren und 2-fach lackieren mit lösemittelfreiem Buntlack seidenmatt",
      "qty": 2,
      "unit": "Stück",
      "price": 45.00
    },
    {
      "title": "Komplettrenovierung - Möbel ausräumen und einräumen, Raum komplett abdecken mit Malervlies, Reinigung nach Abschluss der Arbeiten",
      "qty": 1,
      "unit": "Psch",
      "price": 180.00
    }
  ],
  "total": 972.50
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
- Erstelle eine präzise Gesamtsumme
- Formuliere alle Positionen in professioneller Fachsprache
- Beschreibe den Leistungsumfang klar und detailliert
- Jede Position soll aussagekräftig und präzise formuliert sein`;

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