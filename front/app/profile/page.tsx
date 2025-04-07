import {useAuth} from "@/hooks/checkAuth";

function ProfilePage() {
    const { isLoading } = useAuth({
        required: true,
        redirectTo: '/'
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return <div>Contenu protégé...</div>;
}