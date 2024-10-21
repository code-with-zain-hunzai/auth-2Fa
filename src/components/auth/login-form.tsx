"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CardWrapper } from "./card-wrapper";
import { LoginSchema } from "../../../schemas";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { Login } from "../../../actions/login";
import { useState, useTransition, useRef } from "react";

const LoginForm = () => {
    const searchParams = useSearchParams();
    const urlError =
        searchParams.get("error") === "OAuthAccountNotLinked"
            ? "Email already in use with different provider!"
            : "";
    const [showTwoFactor, setShowTwoFactor] = useState(false);
    const [error, setError] = useState<string | undefined>("");
    const [success, setSuccess] = useState<string | undefined>("");
    const [isPending, startTransition] = useTransition();
    const [twoFactorCode, setTwoFactorCode] = useState(Array(6).fill("")); // For storing 6 inputs

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
        const pasteData = e.clipboardData.getData('text');
        if (pasteData.length === 6) {
            const newCode = [...twoFactorCode];
            for (let i = 0; i < 6; i++) {
                newCode[i] = pasteData[i] || ""; 
                if (inputRefs.current[i]) {
                    inputRefs.current[i]!.value = pasteData[i] || ""; 
                }
            }
            setTwoFactorCode(newCode);
            inputRefs.current[5]?.focus();
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (value.length <= 1) {
            const newCode = [...twoFactorCode];
            newCode[index] = value;
            setTwoFactorCode(newCode);
    
            if (value && index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };
    

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !twoFactorCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        setError("");
        setSuccess("");

        const fullCode = twoFactorCode.join(""); 
        const finalValues = { ...values, code: fullCode };

        startTransition(() => {
            Login(finalValues)
                .then((data) => {
                    if (data?.error) {
                        form.reset();
                        setError(data.error);
                    }
                    if (data?.success) {
                        form.reset();
                        setSuccess(data.success);
                    }
                    if (data?.twoFactor) {
                        setShowTwoFactor(true);
                    }
                })
                .catch(() => setError("Something went wrong"));
        });
    };

    return (
        <CardWrapper
            headerLabel="Welcome back"
            backButtonLabel="Don't have an account?"
            backButtonHref="/auth/register"
            showSocial
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        {showTwoFactor && (
                            <div className="flex gap-2">
                            {twoFactorCode.map((_, index) => (
                                <Input
                                    key={index}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    value={twoFactorCode[index]}
                                    onChange={(e) => handleChange(e, index)}
                                    onPaste={(e) => handlePaste(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="w-12 text-center"
                                    placeholder="-"
                                />
                            ))}
                        </div>
                        
                        )}
                        {!showTwoFactor && (
                            <>
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="zaynhunzai15@gmail.com" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="password" placeholder="Password" />
                                            </FormControl>
                                            <Button
                                                size="sm"
                                                variant="link"
                                                asChild
                                                className="px-0 font-normal"
                                            >
                                                <Link href="/auth/reset">Forgot password?</Link>
                                            </Button>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        )}
                    </div>
                    <FormError message={error || urlError} />
                    <FormSuccess message={success} />
                    <Button disabled={isPending} type="submit" className="w-full">
                        {showTwoFactor ? "Confirm" : "Login"}
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    );
};

export default LoginForm;
