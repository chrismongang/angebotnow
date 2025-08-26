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
  companyName: 'Inatros GmbH',
  street: 'Musterstraße 123',
  city: '90475 Nürnberg',
  email: 'info@inatros.de',
  phone: '+49 911 123456',
  companyLogo: '',
  taxNumber: 'DE123456789',
  vatNumber: 'DE123456789',
  bankName: 'Musterbank AG',
  bankAccount: 'DE89 3704 0044 0532 0130 00',
  bankBic: 'COBADEFFXXX',
  defaultQuotePrefix: 'AN',
  defaultCurrency: 'EUR',
  defaultPaymentTerms: '30 Tage netto',
  defaultValidity: '30 Tage',
  lastQuoteNumber: 0,
  currentYear: new Date().getFullYear()
};

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
  bankName?: string;
  bankAccount?: string;
  bankBic?: string;
} {
  const userData = getUserData();
  return {
    name: userData.companyName,
    address: `${userData.street}\n${userData.city}`, // Line break between street and city
    email: userData.email,
    phone: userData.phone,
    taxNumber: userData.taxNumber,
    vatNumber: userData.vatNumber,
    bankName: userData.bankName,
    bankAccount: userData.bankAccount,
    bankBic: userData.bankBic
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
