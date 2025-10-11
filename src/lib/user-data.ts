import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export interface UserData {
  // Persönliche Informationen
  firstName: string;
  lastName: string;
  
  // Firmeninformationen
  companyName: string;
  street: string;
  city: string;
  email: string;
  phone: string;
  
  // Zusätzliche Firmeninformationen für PDF
  companyLogo: string;
  taxNumber: string;
  vatNumber: string;
  taxOffice: string;
  bankName: string;
  bankAccount: string;
  bankBic: string;
  
  // Angebot-Einstellungen
  defaultQuotePrefix: string;
  defaultCurrency: string;
  defaultPaymentTerms: string;
  defaultValidity: string;
  
  // Angebotsnummern-Verwaltung
  lastQuoteNumber: number;
  currentYear: number;
}

const defaultUserData: UserData = {
  firstName: 'Max',
  lastName: 'Mustermann',
  companyName: '',
  street: '',
  city: '',
  email: '',
  phone: '',
  companyLogo: '',
  taxNumber: '',
  vatNumber: '',
  taxOffice: '',
  bankName: '',
  bankAccount: '',
  bankBic: '',
  defaultQuotePrefix: 'AN',
  defaultCurrency: 'EUR',
  defaultPaymentTerms: '30 Tage netto',
  defaultValidity: '30 Tage',
  lastQuoteNumber: 0,
  currentYear: new Date().getFullYear()
};

// Server-side function to get user data from database
export async function getUserDataFromDB(userId: string): Promise<UserData> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      // Return empty user data for new users
      return {
        firstName: '',
        lastName: '',
        companyName: '',
        street: '',
        city: '',
        email: '',
        phone: '',
        companyLogo: '',
        taxNumber: '',
        vatNumber: '',
        taxOffice: '',
        bankName: '',
        bankAccount: '',
        bankBic: '',
        defaultQuotePrefix: 'AN',
        defaultCurrency: 'EUR',
        defaultPaymentTerms: '30 Tage netto',
        defaultValidity: '30 Tage',
        lastQuoteNumber: 0,
        currentYear: new Date().getFullYear()
      }
    }

    // Helper function to check if a value is empty or null
    const isEmpty = (value: any) => !value || value.trim() === ''

    // Convert database user to UserData format
    return {
      firstName: isEmpty(user.name?.split(' ')[0]) ? '' : user.name?.split(' ')[0] || '',
      lastName: isEmpty(user.name?.split(' ').slice(1).join(' ')) ? '' : user.name?.split(' ').slice(1).join(' ') || '',
      companyName: user.companyName || '',
      street: user.street || '',
      city: user.city || '',
      email: user.email || '',
      phone: user.phone || '',
      companyLogo: user.companyLogo || '',
      taxNumber: user.taxNumber || '',
      vatNumber: user.vatNumber || '',
      taxOffice: user.taxOffice || '',
      bankName: user.bankName || '',
      bankAccount: user.bankAccount || '',
      bankBic: user.bankBic || '',
      defaultQuotePrefix: 'AN', // Default value
      defaultCurrency: 'EUR', // Default value
      defaultPaymentTerms: '30 Tage netto', // Default value
      defaultValidity: '30 Tage', // Default value
      lastQuoteNumber: user.lastQuoteNumber || 0,
      currentYear: user.currentYear || new Date().getFullYear()
    }
  } catch (error) {
    console.error('Error fetching user data from database:', error)
    // Return empty user data on error
    return {
      firstName: '',
      lastName: '',
      companyName: '',
      street: '',
      city: '',
      email: '',
      phone: '',
      companyLogo: '',
      taxNumber: '',
      vatNumber: '',
      taxOffice: '',
      bankName: '',
      bankAccount: '',
      bankBic: '',
      defaultQuotePrefix: 'AN',
      defaultCurrency: 'EUR',
      defaultPaymentTerms: '30 Tage netto',
      defaultValidity: '30 Tage',
      lastQuoteNumber: 0,
      currentYear: new Date().getFullYear()
    }
  }
}

// Server-side function to save user data to database
export async function saveUserDataToDB(userId: string, data: UserData): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: `${data.firstName} ${data.lastName}`,
        companyName: data.companyName,
        street: data.street,
        city: data.city,
        phone: data.phone,
        taxNumber: data.taxNumber,
        vatNumber: data.vatNumber,
        taxOffice: data.taxOffice,
        bankName: data.bankName,
        bankAccount: data.bankAccount,
        bankBic: data.bankBic,
        companyLogo: data.companyLogo,
        lastQuoteNumber: data.lastQuoteNumber,
        currentYear: data.currentYear
      }
    })
  } catch (error) {
    console.error('Error saving user data to database:', error)
    throw error
  }
}

// Client-side function (fallback to localStorage)
export function getUserData(): UserData {
  if (typeof window === 'undefined') {
    return defaultUserData;
  }
  
  try {
    const stored = localStorage.getItem('userData');
    if (stored) {
      return { ...defaultUserData, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
  
  return defaultUserData;
}

// Client-side function (fallback to localStorage)
export function saveUserData(data: UserData): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem('userData', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
}

export function getCompanyInfoForPDF(): {
  name?: string;
  address?: string;
  email?: string;
  phone?: string;
  taxNumber?: string;
  vatNumber?: string;
  taxOffice?: string;
  bankName?: string;
  bankAccount?: string;
  bankBic?: string;
  logo?: string;
} {
  const userData = getUserData();
  return {
    name: userData.companyName,
    address: `${userData.street}\n${userData.city}`, // Line break between street and city
    email: userData.email,
    phone: userData.phone,
    taxNumber: userData.taxNumber,
    vatNumber: userData.vatNumber,
    taxOffice: userData.taxOffice,
    bankName: userData.bankName,
    bankAccount: userData.bankAccount,
    bankBic: userData.bankBic,
    logo: userData.companyLogo
  };
}

export function getFullName(): string {
  const userData = getUserData();
  return `${userData.firstName} ${userData.lastName}`;
}

export function getFirstName(): string {
  const userData = getUserData();
  return userData.firstName;
}

// Server-side function to get next quote number from database
export async function getNextQuoteNumberFromDB(userId: string): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const currentYear = new Date().getFullYear();
    
    // Reset counter if year changed
    if (user.currentYear !== currentYear) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastQuoteNumber: 0,
          currentYear: currentYear
        }
      })
    }
    
    // Increment quote number
    const newQuoteNumber = (user.lastQuoteNumber || 0) + 1;
    
    // Update user's quote number in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        lastQuoteNumber: newQuoteNumber
      }
    })
    
    // Format: AN20250001 (prefix + year + 4-digit number)
    const prefix = 'AN'; // Default prefix
    return `${prefix}${currentYear}${newQuoteNumber.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error getting next quote number from database:', error)
    // Fallback to timestamp-based number
    const timestamp = Date.now().toString().slice(-6);
    return `AN${new Date().getFullYear()}${timestamp}`;
  }
}

// Client-side fallback function
export function getNextQuoteNumber(): string {
  const userData = getUserData();
  const currentYear = new Date().getFullYear();
  
  // Reset counter if year changed
  if (userData.currentYear !== currentYear) {
    userData.lastQuoteNumber = 0;
    userData.currentYear = currentYear;
  }
  
  // Increment quote number
  userData.lastQuoteNumber += 1;
  
  // Save updated data
  saveUserData(userData);
  
  // Format: AN20250001 (prefix + year + 4-digit number)
  return `${userData.defaultQuotePrefix}${currentYear}${userData.lastQuoteNumber.toString().padStart(4, '0')}`;
}

export function generateQuoteFileName(clientName: string, quoteNumber: string): string {
  // Clean client name for filename (remove special characters, replace spaces with underscores)
  const cleanClientName = clientName
    .replace(/[^a-zA-ZäöüßÄÖÜ0-9\s]/g, '') // Remove special characters except letters, numbers, spaces
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .trim();
  
  // Format: Angebot_[ClientName]_[QuoteNumber].pdf
  return `Angebot_${cleanClientName}_${quoteNumber}.pdf`;
}
