"use client"

import Link from "next/link"

export default function Navbar() {
    return (
        <div className="glass flex justify-between items-center px-6 py-4 m-4">

            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                RentWise
            </h1>

            <div className="flex gap-6 text-sm">
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/lease">Lease</Link>
                <Link href="/chat">Chat</Link>
                <Link href="/payments">Payments</Link>
                <Link href="/requests">Requests</Link>
            </div>

        </div>
    )
}