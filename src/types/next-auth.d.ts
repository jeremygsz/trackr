import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT as DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            firstname: string
            lastname: string
            role: string
            onboardingCompleted: boolean
        } & DefaultSession['user']
    }

    interface User extends DefaultUser {
        id: string
        firstname: string
        lastname: string
        role: string
        onboardingCompleted: boolean
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        id: string
        firstname: string
        lastname: string
        role: string
        onboardingCompleted: boolean
    }
}

declare module "@auth/core/adapters" {
    interface AdapterUser extends DefaultUser {
        id: string
        firstname: string
        lastname: string
        role: string
        onboardingCompleted: boolean
    }
}
