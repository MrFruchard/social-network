import React, { useState } from "react"
import { MessageSquare, ChevronUp, ChevronDown } from "lucide-react"

export function MessageDropdown(): React.ReactElement {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-0 right-6 z-20">
            <div className={`bg-black border border-gray-800 rounded-t-lg overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-80' : 'max-h-12'}`}>
                <button
                    className="w-full flex items-center justify-between px-4 py-3 text-white hover:bg-gray-900"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5" />
                        <span className="font-medium">Messages</span>
                    </div>
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </button>

                {isOpen && (
                    <div className="p-4 border-t border-gray-800">
                        <div className="text-gray-400 text-sm mb-2">Messages récents</div>
                        <div className="text-gray-200 hover:bg-gray-900 p-2 rounded cursor-pointer">Aucun message récent</div>
                    </div>
                )}
            </div>
        </div>
    )
}