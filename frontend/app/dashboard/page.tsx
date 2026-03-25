"use client"

import { useEffect, useState } from "react"

export default function Dashboard() {
    const [role, setRole] = useState("")

    useEffect(() => {
        const r = localStorage.getItem("role")
        setRole(r || "")
    }, [])
    function Card({ title }: { title: string }) {
        return (
            <div className="bg-white rounded-xl shadow p-4 hover:scale-105 transition">
                {title}
            </div>
        )
    }
    function LandlordDashboard() {
        return (
            <div className="grid grid-cols-4 gap-6 p-6">
                <Card title="Total Properties" />
                <Card title="Active Tenants" />
                <Card title="Revenue" />
                <Card title="Requests" />
            </div>
        )
    }

    if (role === "landlord") {
        return <LandlordDashboard />
    }
    function TenantDashboard() {
        return (
            <div className="p-6">
                <h1 className="text-xl font-bold">My Rent</h1>
                <button className="bg-green-500 px-4 py-2 text-white">
                    Pay Rent
                </button>
            </div>
        )
    }

    return <TenantDashboard />
}