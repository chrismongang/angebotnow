'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { USE_OPENAI } from '@/lib/ai/provider'
import { processWithMockAI } from '@/lib/ai/mock'
import { processWithOpenAI } from '@/lib/ai/openai'
import { uploadImage } from '@/lib/cloudinary'
import * as Sentry from '@sentry/nextjs'

const uploadSchema = z.object({
  projectInfo: z.string().min(1, 'Projektinfo ist erforderlich'),
  clientName: z.string().min(1, 'Kundenname ist erforderlich'),
})

export async function createQuote(formData: FormData) {
  try {
    console.log('=== Starting quote creation ===')
    
    // Validate form data
    const projectInfo = formData.get('projectInfo') as string
    const clientName = formData.get('clientName') as string
    const file = formData.get('file') as File
    
    console.log('Form data received:', {
      projectInfo: projectInfo?.substring(0, 50) + '...',
      clientName,
      fileSize: file?.size,
      fileType: file?.type
    })
    
    const validatedData = uploadSchema.parse({
      projectInfo,
      clientName,
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

    console.log('Creating quote in database...')

    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not available, using mock mode')
      // Return mock success for demo purposes
      return { 
        success: true, 
        quoteId: 'mock-quote-' + Date.now(),
        message: 'Demo-Modus: Angebot wurde simuliert (keine Datenbank verfügbar)'
      }
    }

    // Create quote in database
    // First, ensure a mock user exists
    let mockUser = await prisma.user.findUnique({
      where: { email: 'mock@angebotnow.de' }
    });

    if (!mockUser) {
      mockUser = await prisma.user.create({
        data: {
          email: 'mock@angebotnow.de',
        }
      });
    }

    const quote = await prisma.quote.create({
      data: {
        clientName: validatedData.clientName,
        projectInfo: validatedData.projectInfo,
        status: 'PENDING',
        userId: mockUser.id,
      },
    })

    console.log('Quote created:', quote.id)

    // Upload image to Cloudinary
    let imageUrl: string;
    
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
        console.log('Image uploaded successfully:', imageUrl);
      }
    } catch (uploadError) {
      console.error('Image upload failed:', uploadError);
      console.log('Falling back to placeholder image');
      imageUrl = `https://via.placeholder.com/800x600/cccccc/666666?text=${encodeURIComponent(validatedData.clientName)}`;
    }

    // Update quote with image URL
    await prisma.quote.update({
      where: { id: quote.id },
      data: { 
        imagePath: imageUrl,
        status: 'AI_DONE'
      },
    })

    console.log('Starting AI processing...')

    // Process with AI (OpenAI or Mock based on feature flag)
    const aiResult = USE_OPENAI 
      ? await processWithOpenAI({ projectInfo: validatedData.projectInfo, imageUrl })
      : await processWithMockAI({ projectInfo: validatedData.projectInfo, imageUrl });

    console.log('AI processing completed')

    // Update quote with AI data and mark as completed
    // PDF generation is now handled via API route
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
    return { success: true, quoteId: quote.id }

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
