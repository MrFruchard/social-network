export const fetchUserInfo = async () => {
    const response = await fetch("http://localhost:80/api/user/info", {
        credentials: "include",
    });
    return response.json();
};