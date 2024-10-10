import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (
    email: string,
    token: string) => {
        const confrimLink = `http://localhost:3000/auth/new-verification?=token${token}`;

        await resend.emails.send({
            from:"onboarding@resend.dev",
            to:email,
            subject:"Confrim your email",
            html:`<p><a href="${confrimLink}">here</a> to confrim email</p>`
        })
}