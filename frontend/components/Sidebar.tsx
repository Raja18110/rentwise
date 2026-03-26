"use client"

import Link from "next/link"

export default function Sidebar() {
    return (
        <div className="w-64 bg-black text-white p-6 min-h-screen">

            <h2 className="text-xl mb-6">RentWise</h2>

            <ul className="space-y-3">
                <li><Link href="/dashboard">Dashboard</Link></li>
                <li><Link href="/lease">Lease</Link></li>
                <li><Link href="/chat">Chat</Link></li>
                <li><Link href="/payments">Payments</Link></li>
                <li><Link href="/requests">Requests</Link></li>
                <li><Link href="/dashboard/settings">Settings</Link></li>
            </ul>

        </div>
    )
}