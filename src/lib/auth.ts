import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import MicrosoftProvider from "next-auth/providers/azure-ad"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

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
