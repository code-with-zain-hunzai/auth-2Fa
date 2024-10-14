import { db } from "@/lib/db"

export const getPassordResetTokenByToken = async (token: string) => {

    try {
        const passwordResetToken = await db.passwordResetToken.findUnique({
            where: { token }
        });
        return passwordResetToken;

    } catch {
        return null;
    }
};

export const getPassordResetTokenByEmail = async (email: string) => {

    try {
        const passwordResetToken = await db.passwordResetToken.findFirst({
            where: { email }
        });
        return passwordResetToken;

    } catch {
        return null;
    }
};