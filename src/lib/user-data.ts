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
  defaultValidity: '30 Tage'
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
} {
  const userData = getUserData();
  return {
    name: userData.companyName,
    address: `${userData.street}, ${userData.city}`,
    email: userData.email,
    phone: userData.phone
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
