
import { useState, useEffect } from "react";
import { fetchUserInfo } from "../api/user/userInfo";

export function useUserData() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getUserData = async () => {
            try {
                setLoading(true);
                const data = await fetchUserInfo();
                setUserData(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        getUserData();
    }, []);

    return { userData, loading, error };
}