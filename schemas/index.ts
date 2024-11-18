import { UserRole } from "@prisma/client";
import * as z from "zod";
import { newPassword } from "../actions/new-password";

export const SettingsSchema = z.object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum([UserRole.ADMIN, UserRole.USER]),
    email: z.optional(z.string().email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6))
})
    .refine((data) => {
        if (data.password && !data.newPassword) {
            return false
        }
        return true
    },{
        message:"New password is required?",
        path:["newPassword"]
    })
    .refine((data) => {
        if (data.newPassword && !data.password) {
            return false
        }
        return true
    },{
        message:"password is required?",
        path:["password"]
    })

export const NewPasswordSchema = z.object({
    password: z.string().min(6, {
        message: "Password must be at least 6 characters",
    }),
});


export const ResetSchema = z.object({
    email: z.string().email({
        message: "Email is required"
    }),
})


export const LoginSchema = z.object({
    email: z.string().email({
        message: "Email is required"
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters"
    }),

    code: z.optional(z.string())
})



export const RegisterSchema = z.object({
    email: z.string().email({
        message: "Email is required"
    }),
    password: z.string().min(6,
        {
            message: "Password must be at least 6 characters"
        }),
    name: z.string().min(3, {
        message: "Name is required"
    }),
})