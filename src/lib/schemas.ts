import { z } from 'zod'

export const quoteSchema = z.object({
  id: z.string(),
  userId: z.string(),
  clientName: z.string().min(1, 'Client name is required'),
  projectInfo: z.string().min(1, 'Project info is required'),
  status: z.enum(['PENDING', 'AI_DONE', 'COMPLETED', 'FAILED']),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const createQuoteSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  projectInfo: z.string().min(1, 'Project info is required'),
})

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
})

export type Quote = z.infer<typeof quoteSchema>
export type CreateQuote = z.infer<typeof createQuoteSchema>
export type User = z.infer<typeof userSchema>
