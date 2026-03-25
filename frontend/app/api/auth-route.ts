import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_SECRET!
        })
    ],
    callbacks: {
        async redirect({ url, baseUrl }) {
            return baseUrl + "/google-success"
        }
    }
})

export { handler as GET, handler as POST }