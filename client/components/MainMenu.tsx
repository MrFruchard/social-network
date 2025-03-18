"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {Home, Bell, MessageSquare, Users, User, Hash, Mail, MessageCircle} from "lucide-react"

export function MainMenu(): React.ReactElement {
    return (
        <div className="fixed left-0 flex w-[28.57%]">
            <ul className="flex flex-col items-center justify-center space-y-8 w-full py-4">
                <li className="w-full max-w-[200px]">
                    <Button
                        variant="ghost"
                        className="justify-start px-3 text-3xl inline-flex whitespace-nowrap"
                    >
                        SИ
                    </Button>
                </li>
                <li className="w-full max-w-[200px]">
                    <Button
                        variant="ghost"
                        className="justify-start px-3 text-xl inline-flex whitespace-nowrap"
                    >
                        <Home className="mr-2 h-5 w-5" /> Accueil
                    </Button>
                </li>
                <li className="w-full max-w-[200px]">
                    <Button
                        variant="ghost"
                        className="justify-start px-3 text-xl inline-flex whitespace-nowrap"
                    >
                        <Bell className="mr-2 h-5 w-5" /> Notifications
                    </Button>
                </li>
                <li className="w-full max-w-[200px]">
                    <Button
                        variant="ghost"
                        className="justify-start px-3 text-xl inline-flex whitespace-nowrap"
                    >
                        <MessageCircle className="mr-2 h-5 w-5" /> Messages
                    </Button>
                </li>
                <li className="w-full max-w-[200px]">
                    <Button
                        variant="ghost"
                        className="justify-start px-3 text-xl inline-flex whitespace-nowrap"
                    >
                        <Users className="mr-2 h-5 w-5" /> Groupes
                    </Button>
                </li>
                <li className="w-full max-w-[200px]">
                    <Button
                        variant="ghost"
                        className="justify-start px-3 text-xl inline-flex whitespace-nowrap"
                    >
                        <User className="mr-2 h-5 w-5" /> Profil
                    </Button>
                </li>
            </ul>
        </div>
    )
}