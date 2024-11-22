"use client"

import { UserInfo } from "@/components/user-info";
import { useCurrentUser } from "../../../../hooks/use-current-user";

const ClientPage = () => {
    const user = useCurrentUser();

    return (
        <div className="w-[600px]">
        <UserInfo 
            label="📱Client Component"
            user={user}
        />
        </div>
    );
}

export default ClientPage;
