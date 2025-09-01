'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { USE_OPENAI } from '@/lib/ai/provider'
import { processWithMockAI } from '@/lib/ai/mock'
import { processWithOpenAI } from '@/lib/ai/openai'
import { uploadImage } from '@/lib/cloudinary'
import { getNextQuoteNumberFromDB } from '@/lib/user-data'
import { checkQuoteLimit, incrementQuoteCount } from '@/lib/subscription'
import * as Sentry from '@sentry/nextjs'

const uploadSchema = z.object({
  projectInfo: z.string().min(1, 'Projektinfo ist erforderlich').max(1000, 'Projektinfo zu lang'),
  clientName: z.string().min(1, 'Kundenname ist erforderlich').max(100, 'Kundenname zu lang'),
  clientStreet: z.string().optional(),
  clientCity: z.string().optional(),
})

// Schema for when address is required
const uploadSchemaWithAddress = z.object({
  projectInfo: z.string().min(1, 'Projektinfo ist erforderlich').max(1000, 'Projektinfo zu lang'),
  clientName: z.string().min(1, 'Kundenname ist erforderlich').max(100, 'Kundenname zu lang'),
  clientStreet: z.string().min(1, 'Straße & Hausnummer ist erforderlich').max(200, 'Straße & Hausnummer zu lang'),
  clientCity: z.string().min(1, 'PLZ & Ort ist erforderlich').max(200, 'PLZ & Ort zu lang'),
})

export async function createQuote(formData: FormData) {
  try {
    console.log('=== Starting quote creation ===')
    
    // Get authenticated user
    const session = await auth()
    if (!session?.user?.id) {
      console.log('No authenticated user found')
      return { success: false, error: 'Nicht angemeldet' }
    }
    
    console.log('Authenticated user:', session.user.id)
    
    // Check subscription limits
    const { canCreate, remainingQuotes, tier } = await checkQuoteLimit(session.user.id);
    
    if (!canCreate) {
      return { 
        success: false, 
        error: `Angebot-Limit erreicht. Sie haben ${remainingQuotes} Angebote übrig. Upgrade auf Pro für unbegrenzte Angebote.`,
        requiresUpgrade: true
      };
    }
    
    // Validate form data
    const projectInfo = formData.get('projectInfo') as string
    const clientName = formData.get('clientName') as string
    const clientStreet = formData.get('clientStreet') as string
    const clientCity = formData.get('clientCity') as string
    const includeAddress = formData.get('includeAddress') === 'true'
    const file = formData.get('file') as File
    
    console.log('Form data received:', {
      projectInfo: projectInfo?.substring(0, 50) + '...',
      clientName,
      clientStreet,
      clientCity,
      includeAddress,
      fileSize: file?.size,
      fileType: file?.type
    })
    
    // Choose validation schema based on whether address is included
    const schemaToUse = includeAddress ? uploadSchemaWithAddress : uploadSchema
    
    const validatedData = schemaToUse.parse({
      projectInfo: projectInfo?.trim(),
      clientName: clientName?.trim(),
      clientStreet: clientStreet?.trim(),
      clientCity: clientCity?.trim(),
    })

    if (!file) {
      console.log('No file uploaded')
      return { success: false, error: 'Keine Datei hochgeladen' }
    }

    console.log('File validation passed')

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      console.log('File too large:', file.size)
      return { success: false, error: 'Datei zu groß (max. 10MB)' }
    }

    if (!file.type.startsWith('image/')) {
      console.log('Invalid file type:', file.type)
      return { success: false, error: 'Nur Bilddateien erlaubt' }
    }

    // Generate quote number for authenticated user
    const quoteNumber = await getNextQuoteNumberFromDB(session.user.id)
    console.log('Generated quote number:', quoteNumber)

    console.log('Creating quote in database...')

    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not available, using mock mode')
      // Return mock success for demo purposes
      return { 
        success: true, 
        quoteId: quoteNumber,
        quoteNumber: quoteNumber,
        message: 'Demo-Modus: Angebot wurde simuliert (keine Datenbank verfügbar)'
      }
    }

    // Create quote in database with authenticated user
    const quote = await prisma.quote.create({
      data: {
        clientName: validatedData.clientName,
        projectInfo: validatedData.projectInfo,
        clientStreet: includeAddress ? validatedData.clientStreet : null,
        clientCity: includeAddress ? validatedData.clientCity : null,
        status: 'PENDING',
        userId: session.user.id,
        quoteNumber: quoteNumber, // Store the structured quote number
      },
    })

    console.log('Quote created:', quote.id, 'with number:', quoteNumber)

    // Upload image to Cloudinary
    let imageUrl: string;
    let publicId: string | undefined;
    
    try {
      // Check if Cloudinary is configured
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.warn('Cloudinary not configured, using placeholder image');
        imageUrl = `https://via.placeholder.com/800x600/cccccc/666666?text=${encodeURIComponent(validatedData.clientName)}`;
      } else {
        console.log('Uploading image to Cloudinary...');
        
        // Convert File to ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        
        // Upload to Cloudinary
        const uploadResult = await uploadImage(arrayBuffer);
        
        if (!uploadResult.success || !uploadResult.url) {
          throw new Error(uploadResult.error || 'Upload failed');
        }
        
        imageUrl = uploadResult.url;
        publicId = uploadResult.publicId;
        console.log('Image uploaded successfully:', imageUrl);
      }
    } catch (uploadError) {
      console.error('Image upload failed:', uploadError);
      console.log('Falling back to placeholder image');
      imageUrl = `https://via.placeholder.com/800x600/cccccc/666666?text=${encodeURIComponent(validatedData.clientName)}`;
    }

    // Update quote with image URL and mark as AI processing
    await prisma.quote.update({
      where: { id: quote.id },
      data: { 
        imagePath: imageUrl,
        status: 'AI_DONE'
      },
    })

    console.log('Starting AI processing...')

    // Process with AI (OpenAI or Mock based on feature flag)
    let aiResult;
    try {
      const shouldUseOpenAI = process.env.USE_OPENAI === 'true' || USE_OPENAI;
      
      if (shouldUseOpenAI) {
        console.log('Using OpenAI for AI processing...')
        aiResult = await processWithOpenAI({ 
          projectInfo: validatedData.projectInfo, 
          imageUrl,
          clientCity: includeAddress ? validatedData.clientCity : undefined
        })
      } else {
        console.log('Using Mock AI for AI processing...')
        aiResult = await processWithMockAI({ 
          projectInfo: validatedData.projectInfo, 
          imageUrl,
          clientCity: includeAddress ? validatedData.clientCity : undefined
        })
      }

      console.log('AI processing completed successfully')
    } catch (aiError) {
      console.error('AI processing failed:', aiError)
      // Use fallback AI data
      aiResult = {
        description: validatedData.projectInfo,
        positions: [
          { title: 'Arbeitsleistung', qty: 1, unit: 'Psch', price: 500 },
          { title: 'Material', qty: 1, unit: 'Psch', price: 300 }
        ],
        total: 800
      }
    }

    // Update quote with AI data and mark as completed
    await prisma.quote.update({
      where: { id: quote.id },
      data: { 
        status: 'COMPLETED',
        aiData: aiResult,
      },
    })

    revalidatePath('/angebote')
    revalidatePath('/dashboard')

    console.log('=== Quote creation completed successfully ===')
    // Increment quote count after successful creation
    await incrementQuoteCount(session.user.id);

    return { 
      success: true, 
      quoteId: quote.id,
      quoteNumber: quoteNumber,
      remainingQuotes: remainingQuotes === -1 ? 'unbegrenzt' : remainingQuotes - 1,
      tier,
      message: 'Angebot erfolgreich erstellt'
    }

  } catch (error) {
    console.error('=== Error in createQuote ===')
    console.error('Error details:', error)
    Sentry.captureException(error)
    
    if (error instanceof z.ZodError) {
      console.log('Zod validation error:', error.errors)
      return { success: false, error: 'Validierungsfehler: ' + error.errors[0].message }
    }
    
    return { success: false, error: 'Ein Fehler ist aufgetreten: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler') }
  }
}

export async function updateQuotePositions(quoteId: string, positions: Array<{ title: string; qty: number; unit: string; price: number }>) {
  try {
    // Get authenticated user
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Nicht angemeldet' }
    }
    
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      return { 
        success: true, 
        message: 'Demo-Modus: Angebot wurde simuliert (keine Datenbank verfügbar)'
      }
    }

    // Get existing quote and verify ownership
    const existingQuote = await prisma.quote.findFirst({
      where: { 
        id: quoteId,
        userId: session.user.id // Only allow access to user's own quotes
      }
    })

    if (!existingQuote) {
      return { success: false, error: 'Angebot nicht gefunden oder Zugriff verweigert' }
    }

    // Calculate new total
    const newTotal = positions.reduce((sum, position) => {
      return sum + (position.qty * position.price)
    }, 0)

    // Update AI data with new positions and total
    const updatedAiData = {
      ...(existingQuote.aiData as any || {}),
      positions: positions,
      total: newTotal
    }

    // Update quote
    await prisma.quote.update({
      where: { id: quoteId },
      data: { 
        aiData: updatedAiData,
      },
    })

    return { 
      success: true, 
      message: 'Angebot erfolgreich aktualisiert'
    }

  } catch (error) {
    return { success: false, error: 'Ein Fehler ist aufgetreten: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler') }
  }
}
