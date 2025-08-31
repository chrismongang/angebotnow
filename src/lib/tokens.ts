import crypto from 'crypto'

// Token-Typen
export type TokenType = 'email-verification' | 'password-reset'

// Token-Generierung
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Token-Hashing für sichere Speicherung
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// Token-Validierung
export function validateToken(inputToken: string, storedHash: string): boolean {
  const inputHash = hashToken(inputToken)
  return inputHash === storedHash
}

// Token-Expiration (in Sekunden)
export const TOKEN_EXPIRATION = {
  'email-verification': 24 * 60 * 60, // 24 Stunden
  'password-reset': 60 * 60 // 1 Stunde
}

// Token-Expiration prüfen
export function isTokenExpired(createdAt: Date, type: TokenType): boolean {
  const expirationSeconds = TOKEN_EXPIRATION[type]
  const expirationDate = new Date(createdAt.getTime() + expirationSeconds * 1000)
  return new Date() > expirationDate
}

// Token-Format für Datenbank
export function createTokenRecord(identifier: string, type: TokenType) {
  const token = generateToken()
  const hashedToken = hashToken(token)
  const expires = new Date(Date.now() + TOKEN_EXPIRATION[type] * 1000)
  
  return {
    identifier,
    token: hashedToken,
    expires,
    type
  }
}
