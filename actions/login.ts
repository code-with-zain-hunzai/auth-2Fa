"use server"
import * as z from "zod"


import { signIn } from '../auth'
import { LoginSchema } from "../schemas";
import { db } from "@/lib/db";
import { DEFAULT_LOGIN_REDIRECT } from "../routes";
import { getTwoFactorTokenByEmail } from "../data/two-fator-token";
import { AuthError } from "next-auth";
import { generateVerificationToken, generateTwoFactorToken } from "@/lib/tokens";
import { getUserByEmail } from "../data/user";
import { sendVerificationEmail, sendTwoFactorTokenEmail } from "@/lib/mail";
import { getTwoFactorConfirmationByUserId } from "../data/two-factor-confirmation";


export const Login = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values);


    if (!validatedFields.success) {
        return { error: "Invalid fields" };
    }
    const { email, password, code } = validatedFields.data;


    const existingUser = await getUserByEmail(email);


    if (!existingUser || !existingUser.email || !existingUser.password) {
        return { error: "Email does not exist!" };
    }


    if (!existingUser.emailVerified) {
        const verificationToken = await generateVerificationToken(existingUser.email)


        await sendVerificationEmail(
            verificationToken.email,
            verificationToken.token
        );


        return { success: "Confirmation email sent!" }
    }


    if (existingUser.isTwoFactorEnabled && existingUser.email) {
        if (code) {
            // Ensure async retrieval of the token
            const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);


            if (!twoFactorToken) {
                return { error: "Invalid code!" }
            }


            // Make sure the comparison is correct and case-sensitive
            if (twoFactorToken.token !== code.trim()) {
                return { error: "Invalid code!" }
            }


            const hasExpired = new Date(twoFactorToken.expires) < new Date();


            if (hasExpired) {
                return { error: "Code expired!" }
            }


            // Delete the token after use
            await db.twoFactorToken.delete({
                where: { id: twoFactorToken.id }
            });


            // Handle existing 2FA confirmation
            const existingConfirmation = await getTwoFactorConfirmationByUserId(
                existingUser.id
            );


            if (existingConfirmation) {
                await db.twoFactorConfirmation.delete({
                    where: { id: existingConfirmation.id }
                })
            }


            // Create new confirmation entry
            await db.twoFactorConfirmation.create({
                data: {
                    userId: existingUser.id
                }
            })
        } else {
            // If no code was provided, send a new token
            const twoFactorToken = await generateTwoFactorToken(existingUser.email)
            await sendTwoFactorTokenEmail(
                twoFactorToken.email,
                twoFactorToken.token
            );
            return { twoFactor: true }
        }
    }


    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: DEFAULT_LOGIN_REDIRECT
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials" }
                default:
                    return { error: "Something went wrong!" }
            }
        }
        throw error;
    }
}
