import { auth, signOut } from "../../../../auth"

const settingsPage = async () => {
    const session = await auth();
    return (
        <div className="text-center">
            {JSON.stringify(session)}
            <form action={async () => {
                "use server"

                await signOut();
            }}>
                <button>Sign Out</button>
            </form>
        </div>
    )
}

export default settingsPage
