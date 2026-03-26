"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

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
function Card({ title, value }: any) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white p-6 rounded-xl shadow-md"
        >
            <h2 className="text-gray-500">{title}</h2>
            <p className="text-2xl font-bold">{value}</p>
        </motion.div>
    )
}