"use client"

import { useState, type ReactNode } from "react"
import { Menu } from "lucide-react"

interface DashboardShellProps {
    children: ReactNode
    sidebar: ReactNode
    brandColorClass: string
    brandBadgeText?: string
    brandBadgeTextClass?: string
    brandBadgeBgClass?: string
    breakpoint?: "md" | "lg"
    contentMaxWidth?: boolean
}

export default function DashboardShell({
    children,
    sidebar,
    brandColorClass,
    brandBadgeText,
    brandBadgeTextClass,
    brandBadgeBgClass,
    breakpoint = "md",
    contentMaxWidth = true,
}: DashboardShellProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const bp = breakpoint

    const overlay = sidebarOpen && (
        <div
            className={`fixed inset-0 ${bp === "lg" ? "bg-black/50 backdrop-blur-sm" : "bg-black/40"} z-40 ${bp === "lg" ? "lg:hidden" : "md:hidden"} transition-opacity`}
            onClick={() => setSidebarOpen(false)}
        />
    )

    return (
        <div className="flex min-h-screen bg-gray-50">
            {bp === "lg" ? (
                <>
                    <div className="hidden lg:block">
                        {sidebar}
                    </div>
                    {overlay}
                    <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        {sidebar}
                    </div>
                </>
            ) : (
                <>
                    {overlay}
                    <div className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-300 ease-in-out`}>
                        {sidebar}
                    </div>
                </>
            )}

            <main className="flex-1 flex flex-col w-full md:w-auto">
                <header className={`${bp === "lg" ? "lg:hidden" : "md:hidden"} bg-white border-b border-gray-200 p-4 flex justify-between items-center sticky top-0 z-10 shadow-sm`}>
                    <div className="flex items-center gap-2">
                        <span className={`font-bold ${brandColorClass} text-xl`}>Joby</span>
                        {brandBadgeText && brandBadgeTextClass && brandBadgeBgClass && (
                            <span className={`text-[10px] font-bold ${brandBadgeTextClass} ${brandBadgeBgClass} px-2 py-0.5 rounded-full`}>
                                {brandBadgeText}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-gray-500 hover:bg-gray-100 p-2 rounded-md transition-colors"
                    >
                        {bp === "lg" ? (
                            <Menu className="w-6 h-6" />
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </header>
                {contentMaxWidth ? (
                    <div className="p-4 md:p-8 flex-1 overflow-y-auto">
                        <div className="max-w-4xl mx-auto">
                            {children}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto">
                        {children}
                    </div>
                )}
            </main>
        </div>
    )
}
