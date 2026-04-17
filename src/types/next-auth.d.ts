import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT as DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            firstname: string
            lastname: string
            role: string
        } & DefaultSession['user']
    }

    interface User extends DefaultUser {
        firstname: string
        lastname: string
        role: string
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        id: string
        firstname: string
        lastname: string
        role: string
    }
}

declare module "@auth/core/adapters" {
    interface AdapterUser extends DefaultUser {
        firstname: string
        lastname: string
        role: string
    }
}
