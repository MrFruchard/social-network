"use client"

import CheckAuth from "@/hooks/checkAuth";
import useAuth from "@/hooks/checkAuth";
import {LogoutButton} from "@/components/logout-button";

export default function HomePage(){

    const prenom = "MASTER"

    const { isLoading, isAuthenticated} = useAuth({
        required: true,
        redirectTo: '/'
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <>
            {isAuthenticated && (
                <div className="grid grid-cols-5 grid-rows-5 gap-4">
                    <div className="row-span-5 border">
                        <ul>
                            <li>1</li>
                            <li>2</li>
                            <li>3</li>
                            <li>4</li>
                            <li><LogoutButton/></li>
                        </ul>
                    </div>
                    <div className="col-span-3 border">{`Bienvenue, ${prenom} !`}</div>
                    <div className="row-span-5 col-start-5 border">3</div>
                    <div className="col-span-3 row-span-4 col-start-2 row-start-2 border">4</div>
                </div>
            )}
        </>
    )
}