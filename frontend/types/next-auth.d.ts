import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user_id?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user_id?: string
  }
}