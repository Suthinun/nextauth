import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from "next-auth/providers/google"
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { PrismaAdapter } from '@auth/prisma-adapter'


const prisma = new PrismaClient()

export const authOptions = {
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: 'Email', type: 'email', placeholder: 'john@doe.com' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials, req) {
          if (!credentials) return null
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })
  
          if (
            user &&
            (await bcrypt.compare(credentials.password, user.password))
          ) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role, // ทำการเพิ่ม role จากการดึงผ่าน database ส่งออกไป
            }
          } else {
            throw new Error('Invalid email or password')
          }
        },
      }),
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
      
    ],
    adapter: PrismaAdapter(prisma),
    session: {
      strategy: 'jwt',
    },
    callbacks: {
      jwt: async ({ token, user }) => {
        if (user) {
          token.id = user.id
          token.role = user.role // เพิ่ม role เข้าไป
          
        }
        return token
      },
      session: async ({ session, token }) => {
        if (session.user) {
          session.user.id = token.id
          session.user.role = token.role // เพิ่ม role เข้าไป
          session.user.image = token.picture // เพิ่มการรับรูปภาพเข้ามา
        }
        return session
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/profile`
    },
  },
}
  
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }