import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import MicrosoftProvider from "next-auth/providers/azure-ad"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { trackEvent, updateUserProperties } from "@/lib/loops"
import { trackLogin } from "@/components/analytics/google-analytics"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    MicrosoftProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
      name: "Microsoft",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string
          },
          select: {
            id: true,
            email: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true,
            password: true,
            emailVerified: true
          }
        })

        if (!user || !user.password) {
          return null
        }

        // Prüfen ob Email verifiziert ist (nur für Email/Password Auth)
        if (!user.emailVerified) {
          console.log('Login attempt with unverified email:', credentials.email as string)
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // Google Analytics Event: login
        try {
          trackLogin('credentials', user.id)
        } catch (gaError) {
          console.error('Failed to track Google Analytics login event:', gaError);
          // Continue without tracking - not critical for login
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          image: user.image,
        }
      }
    })
  ],
  callbacks: {
    // @ts-ignore
    session: async ({ session, user }) => {
      if (session?.user && user?.id) {
        session.user.id = user.id
        // Add firstName and lastName to session
        // @ts-ignore
        if (user.firstName) {
          // @ts-ignore
          session.user.firstName = user.firstName
        }
        // @ts-ignore
        if (user.lastName) {
          // @ts-ignore
          session.user.lastName = user.lastName
        }
      }
      return session
    },
    // @ts-ignore
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        // Add firstName and lastName to JWT token
        // @ts-ignore
        if (user.firstName) {
          // @ts-ignore
          token.firstName = user.firstName
        }
        // @ts-ignore
        if (user.lastName) {
          // @ts-ignore
          token.lastName = user.lastName
        }
      }
      return token
    },
    // @ts-ignore
    signIn: async ({ user, account, profile }) => {
      // Prüfe ob es ein neuer User ist (OAuth-Registrierung)
      if (account?.provider === 'google' || account?.provider === 'azure-ad') {
        try {
          // Prüfe ob User bereits existiert
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { id: true, createdAt: true }
          })

          // Wenn User nicht existiert, ist es eine neue Registrierung
          if (!existingUser) {
            console.log('🆕 New OAuth user detected:', user.email)
            
            // Warte kurz, damit der User in der DB erstellt wird
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Loops Event: signed_up für OAuth-Registrierung
            try {
              await trackEvent(user.email!, 'signed_up', {
                userId: user.id,
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ').slice(1).join(' ') || '',
                plan: 'free',
                quotesCount: 0,
                createdAt: new Date().toISOString(),
                source: account.provider === 'google' ? 'google_oauth' : 'microsoft_oauth'
              })
              console.log('✅ Loops signed_up event tracked for OAuth user:', user.email)
            } catch (trackingError) {
              console.error('❌ Failed to track signed_up event for OAuth user:', trackingError)
            }

            // Google Analytics Event: sign_up für OAuth-Registrierung
            try {
              trackRegistration({
                userId: user.id,
                email: user.email!,
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ').slice(1).join(' ') || ''
              })
              console.log('✅ Google Analytics sign_up event tracked for OAuth user:', user.email)
            } catch (gaError) {
              console.error('❌ Failed to track Google Analytics sign_up event for OAuth user:', gaError)
            }

            // Enhanced Meta Conversions API Event: CompleteRegistration für OAuth
            try {
              const { trackUserRegistration, getFacebookClickId, getFacebookBrowserId } = await import('@/lib/meta-conversions');
              
              await trackUserRegistration({
                email: user.email!,
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ').slice(1).join(' ') || '',
                userId: user.id || '',
                fbc: getFacebookClickId(),
                fbp: getFacebookBrowserId(),
              }, account.provider === 'google' ? 'google_oauth' : 'microsoft_oauth');
              
              console.log('✅ Enhanced Meta CompleteRegistration event tracked for OAuth user:', user.email);
            } catch (trackingError) {
              console.error('❌ Enhanced Meta CompleteRegistration tracking failed for OAuth user:', trackingError);
            }

            // User Properties in Loops setzen
            try {
              await updateUserProperties(user.email!, {
                userId: user.id,
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ').slice(1).join(' ') || '',
                plan: 'free',
                quotesCount: 0,
                source: account.provider === 'google' ? 'google_oauth' : 'microsoft_oauth'
              })
              console.log('✅ Loops user properties updated for OAuth user:', user.email)
            } catch (propertiesError) {
              console.error('❌ Failed to update user properties for OAuth user:', propertiesError)
            }
          } else {
            console.log('👤 Existing OAuth user login:', user.email)
            
            // Google Analytics Event: login für bestehende OAuth-User
            try {
              trackLogin(account.provider === 'google' ? 'google_oauth' : 'microsoft_oauth', user.id)
              console.log('✅ Google Analytics login event tracked for existing OAuth user:', user.email)
            } catch (gaError) {
              console.error('❌ Failed to track Google Analytics login event for existing OAuth user:', gaError)
            }
          }
        } catch (error) {
          console.error('❌ Error in signIn callback:', error)
          // Nicht blockierend - Auth funktioniert weiter
        }
      }
      
      return true
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 Tage
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  // Chunk-Loading-Optimierungen
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
})
