"use client"

import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useSession } from "next-auth/react"

import { SettingsSchema } from "../../../../schemas"
import {
    Card,
    CardHeader,
    CardContent
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { settings } from "../../../../actions/setting"
import {
    Form,
    FormField,
    FormControl,
    FormItem,
    FormLabel,
    FormDescription,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useCurrentUser } from "../../../../hooks/use-current-user"
import { FormSuccess } from "@/components/form-success"
import { FormError } from "@/components/form-error"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { UserRole } from "@prisma/client"

const settingsPage = () => {
    const user = useCurrentUser()
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();

    const { update } = useSession();
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof SettingsSchema>>({
        resolver: zodResolver(SettingsSchema),
        defaultValues: {
            password: undefined,
            name: user?.name || undefined,
            email: user?.email || undefined,
            role: user?.role || undefined,
        }
    });

    const onSubmit = (values: z.infer<typeof SettingsSchema>) => {
        startTransition(() => {
            settings(values)
                .then((data) => {
                    if (data.error) {
                        setError(data.error)
                    }
                    if (data.success) {
                        update()
                        setSuccess(data.success)
                    }
                })
                .catch(() => setError("Somethings went wrong!"))
        });

    }

    return (
        <Card className="w-[600px]">
            <CardHeader>
                <p className=" text-2xl font-semibold text-center">
                    ⚙ Settings
                </p>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        className="space-y-6"
                        onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => {
                                    return <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="zain"
                                                disabled={isPending} />
                                        </FormControl>
                                    </FormItem>
                                }} />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => {
                                    return <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="zaynhunzai5@gmail.com"
                                                type="email"
                                                disabled={isPending} />
                                        </FormControl>
                                    </FormItem>
                                }} />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => {
                                    return <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="****"
                                                type="password"
                                                disabled={isPending} />
                                        </FormControl>
                                    </FormItem>
                                }} />
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => {
                                    return <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="****"
                                                type="password"
                                                disabled={isPending} />
                                        </FormControl>
                                    </FormItem>
                                }} />
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select
                                            disabled={isPending}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                                                <SelectItem value={UserRole.USER}>User</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                        </div>
                        <FormError message={error} />
                        <FormSuccess message={success} />
                        <Button
                            disabled={isPending}
                            type="submit">
                            Save
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
export default settingsPage
