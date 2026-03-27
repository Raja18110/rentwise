"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getUser } from "../../utils/auth"
import axios from "axios"

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null)
    const [leases, setLeases] = useState([])

    useEffect(() => {
        const u = getUser()
        setUser(u)

        axios.get("http://127.0.0.1:8000/lease")
            .then(res => setLeases(res.data))
            .catch(err => console.error(err))

    }, [])

    if (!user) return <div className="p-6">Loading...</div>

    return (
        <div className="p-6">

            <h1 className="text-2xl font-bold mb-6">
                Welcome, {user.email}
            </h1>

            {user.role === "landlord" ? (
                <LandlordDashboard />
            ) : (
                <TenantDashboard />
            )}
            <div className="mt-8">
                <h2 className="text-xl mb-3">Leases</h2>

                {leases.length === 0 ? (
                    <p>No leases found</p>
                ) : (
                    leases.map((l: any) => (
                        <div key={l.id} className="glass p-4 mb-2">
                            {l.property_name} → ₹{l.rent_amount} ({l.status})
                        </div>
                    ))
                )}
            </div>

        </div>
    )
}

function LandlordDashboard() {
    return (
        <div className="grid grid-cols-4 gap-6">
            <Card title="Total Properties" value="5" />
            <Card title="Active Tenants" value="12" />
            <Card title="Monthly Revenue" value="₹50,000" />
            <Card title="Requests" value="3" />
        </div>
    )
}

function TenantDashboard() {
    return (
        <div>
            <h2 className="text-xl mb-4">Tenant Dashboard</h2>

            <button className="btn">
                Pay Rent
            </button>
        </div>
    )
}

function Card({ title, value }: any) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass p-6"
        >
            <h2 className="text-gray-300">{title}</h2>
            <p className="text-2xl font-bold">{value}</p>
        </motion.div>
    )
}