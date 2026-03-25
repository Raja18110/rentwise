"use client"

import Link from "next/link"

export default function Sidebar() {
    return (
        <div className="w-64 h-screen bg-gradient-to-b from-black to-gray-800 text-white p-6">

            <h1 className="text-2xl font-bold mb-8">RentWise</h1>

            <nav className="space-y-4">

                <Link href="/dashboard" className="block hover:text-blue-400">
                    Dashboard
                </Link>

                <Link href="/payments" className="block hover:text-blue-400">
                    Payments
                </Link>

                <Link href="/requests" className="block hover:text-blue-400">
                    Requests
                </Link>

                <Link href="/chat" className="block hover:text-blue-400">
                    Messages
                </Link>

            </nav>
        </div>
    )
}