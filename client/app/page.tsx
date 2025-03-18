
"use client"

import React from "react"
import { Header } from "@/components/Header"
import { ThemeToggle } from "@/components/ThemeToggle"
import { MessageDropdown } from "@/components/MessageDropdown"
import {DisplayPosts} from "@/components/DisplayPosts";
import {MainMenu} from "@/components/MainMenu";

export default function Home(): React.ReactElement {
    return (
        <div className="grid grid-cols-7 grid-rows-5 gap-4">
            <div className="col-span-2 row-span-5 border h-full">
                <MainMenu />
            </div>
            <div className="col-span-3 row-span-4 col-start-3 row-start-2 border" >
                <DisplayPosts />
            </div>
            <div className="col-span-2 row-span-4 col-start-6 row-start-2">
                GROUPES
                SUGGESTIONS
                <ThemeToggle />
                <MessageDropdown />
            </div>
            <div className="col-span-5 col-start-3 row-start-1">
                <Header />
            </div>
        </div>
    )
}