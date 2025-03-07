
// file: ~/server/api/auth/[...].ts
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

import { NuxtAuthHandler } from '#auth'

const config = useRuntimeConfig()

export default NuxtAuthHandler({
    // A secret string you define, to ensure correct encryption
    secret: process.env.PRODUCTION == 'true'
        ? process.env.KG_API_KEY
        : process.env.KG_DEV_API_KEY,

    callbacks: {
        // Callback when the JWT is created / updated, see https://next-auth.js.org/configuration/callbacks#jwt-callback
        jwt: async ({ token, user, account }) => {
            if (user) {
                token.jwt = account.access_token
                token.provider = account.provider
                token.user = user
            }
            return Promise.resolve(token)
        },
        // Callback whenever session is checked, see https://next-auth.js.org/configuration/callbacks#session-callback
        session: async ({ session, token }) => {
            session.provider = token.provider
            session.token = token.jwt
            session.user = token.user
            return Promise.resolve(session)
        },
    },

    providers: [

        GithubProvider.default({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),

        GoogleProvider.default({
            authorization: "https://accounts.google.com/o/oauth2/auth",
            userInfo: "https://www.googleapis.com/oauth2/v3/userinfo",
            token: "https://oauth2.googleapis.com/token",
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),

        // Cilogon
        {
            id: 'cilogon',
            name: 'CILogon',
            type: 'oauth',
            version: '2.0',
            authorization: 'https://cilogon.org/authorize/',
            token: 'https://cilogon.org/oauth2/token',
            userinfo: 'https://cilogon.org/oauth2/userinfo',
            profile: (profile) => {
                return {
                    id: profile.iss + profile.sub,
                    name: profile.name,
                    email: profile.email,
                    affiliation: profile.affiliation
                }
            }
        },

        config.public.testing === 'true'
        ? CredentialsProvider.default({
            name: 'Credentials',
            credentials: {
                username: { label: 'username', type: 'text' },
                password: { label: 'password', type: 'password' }
            },
            async authorize(credentials) {
                const { username, password } = credentials
                if (username === 'testuser' && password === 'testuser') {
                    return {
                        id: 1,
                        name: 'Test User',
                        email: 'testing@example.com'
                    }
                }
                return null
            },
        })
        : undefined,
    ]
})