import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain=process.env.NEXT_PUBLICE_APP_URL;

export const sendTwoFactorTokenEmail = async (
    email: string,
    token: string
) => {
await resend.emails.send({
    from: "onboarding@resend.dev",
        to: email,
        subject: "2Fa Code",
        html: `<p>Your 2Fa code ${token}</p>`
})
}
export const sendPasswordResetEmail = async (
    email: string,
    token: string,
) => {
    const resetLink = `${domain}/auth/new-password?token=${token}`

    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Reset your password",
        html: `<p><a href="${resetLink}">here</a> to confrim email</p>`
    })
}

export const sendVerificationEmail = async (
    email: string,
    token: string) => {
    const confirmLink = `${domain}/auth/new-verification?token=${token}`;


    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Confrim your email",
        html: `<p><a href="${confirmLink}">here</a> to Reset password</p>`
    })
}