import NextAuth from "next-auth"
import authConfig from "./auth.config"
import { getUserById } from "./data/user"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import { getTwoFactorConfirmationByUserId } from "./data/two-factor-confirmation"


export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut
} = NextAuth({
    pages: {
        signIn: "/auth/login",
        error: "/auth/error"
    },
    events: {
        async linkAccount({ user }) {
            await db.user.update({
                where: { id: user.id },
                data: { emailVerified: new Date() }
            })
        }
    },
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider !== "credentials") return true;
    
            if (!user?.id) {
                console.log("User ID not found.");
                return false;
            }
    
            const existingUser = await getUserById(user.id);
    
            // Prevent sign in without email verification
            if (!existingUser?.emailVerified) {
                console.log("Email not verified.");
                return false;
            }
    
            // Check if 2FA is enabled for the user
            if (existingUser.isTwoFactorEnabled) {
                // Here you should implement the logic to check if the 2FA code has been provided and is valid.
                // For example, you might want to redirect the user to a 2FA input page or validate a token.
                const isTwoFactorConfirmed = await getTwoFactorConfirmationByUserId(user.id);
                if (!isTwoFactorConfirmed) {
                    console.log("2FA not confirmed.");
                    return false; // Block login if 2FA is not confirmed
                }
            }
    
            return true; // Allow login if all checks pass
        },
        async session({ token, session }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
    
            if (token.role && session.user) {
                session.user.role = token.role;
            }
            return session;
        },
        async jwt({ token }) {
            if (!token.sub) return token;
            const existingUser = await getUserById(token.sub);
    
            if (!existingUser) return token;
    
            token.role = existingUser.role;
    
            return token;
        }
    },
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    ...authConfig
})