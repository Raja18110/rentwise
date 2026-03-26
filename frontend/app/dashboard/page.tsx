"use client"

import { useEffect, useState } from "react"

export default function DashboardPage() {
    const [role, setRole] = useState("")

    useEffect(() => {
        const r = localStorage.getItem("role")
        setRole(r || "")
    }, [])

    if (role === "landlord") {
        return <h1>Landlord Dashboard</h1>
    }

    return <h1>Tenant Dashboard</h1>
}


function LandlordDashboard() {
    return (
        <div className="grid grid-cols-4 gap-6 p-6">
            <Card title="Total Properties" />
            <Card title="Active Tenants" />
            <Card title="Monthly Revenue" />
            <Card title="Maintenance Requests" />
        </div>
    )
}

function TenantDashboard() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Tenant Dashboard</h1>

            <button className="bg-green-600 text-white px-4 py-2 rounded">
                Pay Rent
            </button>
        </div>
    )
}

function Card({ title }: { title: string }) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-4 hover:scale-105 transition">
            <h2 className="font-semibold">{title}</h2>
        </div>
    )
}