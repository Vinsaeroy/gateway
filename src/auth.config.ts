import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: '/auth/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false;
            } else if (isLoggedIn && nextUrl.pathname === '/auth/login') {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
        async redirect({ url, baseUrl }) {
            // Force use of NEXTAUTH_URL/BASE_URL instead of internal hostname
            const targetBase = process.env.NEXTAUTH_URL || process.env.BASE_URL || baseUrl;
            
            // If url is relative, prepend the proper base
            if (url.startsWith("/")) return `${targetBase}${url}`;
            
            // If url contains 0.0.0.0 or localhost, replace with proper base
            if (url.includes("0.0.0.0") || url.includes("localhost")) {
                try {
                    const u = new URL(url);
                    return `${targetBase}${u.pathname}${u.search}`;
                } catch {
                    return targetBase;
                }
            }
            
            // If url is on same origin as targetBase, allow
            if (url.startsWith(targetBase)) return url;
            
            // Default: go to base
            return targetBase;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role;
            }
            return session;
        }
    },
    providers: [], // Configured in auth.ts
    session: {
        strategy: 'jwt'
    },
    trustHost: true,
} satisfies NextAuthConfig;
