"use client"

import React from "react"
import { Button } from "@/components/ui/button"

export function Header(): React.ReactElement {
    return (
        <div className="flex fixed justify-between items-center px-4 py-3 border-b border-gray-800">
            <div className="flex items-center">
                <h1 className="text-xl font-bold">ACTU / FEED</h1>
            </div>

            <Button className="bg-blue-100 text-navy-900 hover:bg-blue-200">
                Frontend Mentor
            </Button>
        </div>
    )
}