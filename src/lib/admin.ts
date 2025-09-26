import { auth } from '@/lib/auth'

export async function getAdminSession() {
  const session = await auth()
  
  // Nur E-Mails aus der .env Datei erlauben
  const adminEmails = process.env.ADMIN_EMAILS || ''
  const emails = adminEmails
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  
  const isAdmin = !!session?.user?.email && emails.includes(session.user.email!.toLowerCase())
  return { session, isAdmin }
}

export async function requireAdmin() {
  const { session, isAdmin } = await getAdminSession()
  if (!isAdmin) {
    return { isAdmin: false, session }
  }
  return { isAdmin: true, session }
}


