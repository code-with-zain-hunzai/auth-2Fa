import { auth } from "../../../../auth"

const settingsPage = async () => {
    const session = await auth();
    return (
        <div>
            {JSON.stringify(session)}
        </div>
    )
}

export default settingsPage
