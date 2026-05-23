import type { NextAuthConfig } from "next-auth";

interface ExtendedUser {
    id?: string;
    role?: string;
    email?: string | null;
    name?: string | null;
}

export const authConfig = {
    pages: {
        signIn: '/auth/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            
            // Only handle redirect from /auth/login when already logged in
            // Dashboard auth is handled by proxy.ts to avoid duplicate callbackUrl
            if (isLoggedIn && nextUrl.pathname === '/auth/login') {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as ExtendedUser).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                (session.user as ExtendedUser).role = token.role as string;
            }
            return session;
        }
    },
    providers: [],
    session: {
        strategy: 'jwt'
    },
    trustHost: true,
} satisfies NextAuthConfig;
