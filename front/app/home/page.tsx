"use client"

import CheckAuth from "@/hooks/checkAuth";

export default function HomePage(){

    CheckAuth();

    return (

        <div className="grid grid-cols-5 grid-rows-5 gap-4">
            <div className="row-span-5 border">
                <ul>
                    <li>1</li>
                    <li>2</li>
                    <li>3</li>
                    <li>4</li>
                </ul>
            </div>
            <div className="col-span-3 border">2</div>
            <div className="row-span-5 col-start-5 border">3</div>
            <div className="col-span-3 row-span-4 col-start-2 row-start-2 border">4</div>
        </div>

    )
}