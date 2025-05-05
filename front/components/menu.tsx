"use client";

import Link from "next/link";
import LogoutButton from "@/components/logout-button";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/modeToggle";
import NotificationDropdown from "@/components/NotificationDropdown";

export default function Menu() {
    return (
        <div className="flex justify-between items-center p-4 bg-primary">
            <div>
                <Link href="/home">
                    <Button className="p-2 hover:text-indi">
                        Home
                    </Button>
                </Link>
                <Link href="/profile">
                    <Button className="p-2 hover:text-indi">
                        Profile
                    </Button>
                </Link>
            </div>

            <div className="flex items-center space-x-4">
                <NotificationDropdown />
                <ModeToggle />
                <LogoutButton />
            </div>
        </div>
    );
}