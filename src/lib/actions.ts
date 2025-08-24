'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { createQuoteSchema } from '@/lib/schemas'
import { processWithMockAI } from '@/lib/ai/mock'
import { generatePDF } from '@/lib/pdf/generate'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import * as Sentry from '@sentry/nextjs'

const uploadSchema = z.object({
  projectInfo: z.string().min(1, 'Projektinfo ist erforderlich'),
  clientName: z.string().min(1, 'Kundenname ist erforderlich'),
})

export async function createQuote(formData: FormData) {
  try {
    // Validate form data
    const validatedData = uploadSchema.parse({
      projectInfo: formData.get('projectInfo'),
      clientName: formData.get('clientName'),
    })

    const file = formData.get('file') as File
    if (!file) {
      return { success: false, error: 'Keine Datei hochgeladen' }
    }

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'Datei zu groß (max. 10MB)' }
    }

    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Nur Bilddateien erlaubt' }
    }

    // Create quote in database
    const quote = await prisma.quote.create({
      data: {
        clientName: validatedData.clientName,
        projectInfo: validatedData.projectInfo,
        status: 'PENDING',
        userId: 'mock-user-id', // TODO: Replace with actual user ID
      },
    })

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads')
    await mkdir(uploadsDir, { recursive: true })
    
    const fileName = `${quote.id}-${file.name}`
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, buffer)

    // Update quote with file path
    await prisma.quote.update({
      where: { id: quote.id },
      data: { 
        imagePath: fileName,
        status: 'AI_DONE' // Skip to AI processing
      },
    })

    // Process with Mock AI
    const aiResult = await processWithMockAI({
      projectInfo: validatedData.projectInfo,
      clientName: validatedData.clientName,
      imagePath: fileName,
    })

    if (!aiResult.success) {
      await prisma.quote.update({
        where: { id: quote.id },
        data: { status: 'FAILED' },
      })
      return { success: false, error: 'AI-Verarbeitung fehlgeschlagen' }
    }

    // Generate PDF
    const pdfResult = await generatePDF({
      quoteId: quote.id,
      clientName: validatedData.clientName,
      projectInfo: validatedData.projectInfo,
      aiData: aiResult.data,
    })

    if (!pdfResult.success) {
      await prisma.quote.update({
        where: { id: quote.id },
        data: { status: 'FAILED' },
      })
      return { success: false, error: 'PDF-Generierung fehlgeschlagen' }
    }

    // Update quote with PDF path and mark as completed
    await prisma.quote.update({
      where: { id: quote.id },
      data: { 
        pdfPath: pdfResult.pdfPath,
        status: 'COMPLETED',
        aiData: aiResult.data,
      },
    })

    revalidatePath('/angebote')
    revalidatePath('/dashboard')

    return { success: true, quoteId: quote.id }

  } catch (error) {
    Sentry.captureException(error)
    console.error('Error creating quote:', error)
    
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validierungsfehler: ' + error.errors[0].message }
    }
    
    return { success: false, error: 'Ein Fehler ist aufgetreten' }
  }
}
