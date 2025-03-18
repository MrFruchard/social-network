"use client"

import React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle(): React.ReactElement {
    const { theme, setTheme } = useTheme()

    const toggleTheme = (): void => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <div className="fixed bottom-16 right-6 z-20">
            <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full bg-gray-800 border-gray-700 hover:bg-gray-700 shadow-lg">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all text-yellow-400 dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all text-blue-300 dark:rotate-0 dark:scale-100" />
            </Button>
        </div>
    )
}