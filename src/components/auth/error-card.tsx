import { Header } from "@/components/auth/header";
import { BackButton } from "@/components/auth/back-button";
import {
    Card,
    CardFooter,
    CardHeader
} from "@/components/ui/card"

export const ErrorCard = () => {
    return (
        <Card>
            <CardHeader>
                <Header label="Oops! somethings went wrong!" />
            </CardHeader>
            <CardFooter>
                <BackButton label="Back to login"
                href="/auth/login"/>
            </CardFooter>
        </Card>
    );
};