import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date))
}

// Helper function to calculate total from positions
export function calculateTotal(positions: Array<{ qty: number; price: number }>): number {
  if (!positions || !Array.isArray(positions)) {
    return 0
  }
  
  return positions.reduce((sum, position) => {
    const qty = typeof position.qty === 'number' ? position.qty : 0
    const price = typeof position.price === 'number' ? position.price : 0
    return sum + (qty * price)
  }, 0)
}

// Helper function to get total with VAT
export function calculateTotalWithVAT(total: number, vatRate: number = 0.19, excludeVAT: boolean = false): number {
  if (excludeVAT) {
    return total; // Keine MwSt. bei § 13b UStG
  }
  return total * (1 + vatRate)
}

// Helper function to format price
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}
