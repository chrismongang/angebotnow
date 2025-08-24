import { z } from 'zod'

const aiResponseSchema = z.object({
  positions: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unit: z.string(),
    unitPrice: z.number(),
    totalPrice: z.number(),
  })),
  summary: z.object({
    subtotal: z.number(),
    tax: z.number(),
    total: z.number(),
  }),
  notes: z.string(),
})

export type AIResponse = z.infer<typeof aiResponseSchema>

interface MockAIInput {
  projectInfo: string
  clientName: string
  imagePath: string
}

export async function processWithMockAI(input: MockAIInput): Promise<{
  success: boolean
  data?: AIResponse
  error?: string
}> {
  try {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate mock structured data based on project info
    const mockData: AIResponse = {
      positions: [
        {
          description: "Materialkosten",
          quantity: 1,
          unit: "Pauschal",
          unitPrice: 150.00,
          totalPrice: 150.00,
        },
        {
          description: "Arbeitszeit",
          quantity: 8,
          unit: "Stunden",
          unitPrice: 45.00,
          totalPrice: 360.00,
        },
        {
          description: "Zusatzmaterialien",
          quantity: 1,
          unit: "Pauschal",
          unitPrice: 75.00,
          totalPrice: 75.00,
        },
      ],
      summary: {
        subtotal: 585.00,
        tax: 111.15,
        total: 696.15,
      },
      notes: `Basierend auf Ihrer Projektbeschreibung "${input.projectInfo}" haben wir folgendes Angebot erstellt. Die Preise beinhalten Material, Arbeitszeit und alle notwendigen Zusatzmaterialien.`,
    }

    // Validate the mock data
    const validatedData = aiResponseSchema.parse(mockData)

    return {
      success: true,
      data: validatedData,
    }

  } catch (error) {
    console.error('Mock AI processing error:', error)
    return {
      success: false,
      error: 'AI-Verarbeitung fehlgeschlagen',
    }
  }
}
