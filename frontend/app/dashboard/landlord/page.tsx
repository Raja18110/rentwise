"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import API from "@/utils/api"
import { motion } from "framer-motion"

export default function LandlordPage() {
    const [properties, setProperties] = useState<any[]>([])
    const [tenants, setTenants] = useState<any[]>([])
    const [requests, setRequests] = useState<any[]>([])
    const [revenue, setRevenue] = useState(0)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [propertyRes, leaseRes, paymentRes, requestRes] = await Promise.all([
                axios.get(`${API}/property`),
                axios.get(`${API}/lease`),
                axios.get(`${API}/payment`),
                axios.get(`${API}/request`)
            ])

            setProperties(propertyRes.data || [])

            setTenants(
                (leaseRes.data || []).filter((l: any) => l.status === "active")
            )

            const total = (paymentRes.data || []).reduce(
                (sum: number, p: any) => sum + (p.amount || 0),
                0
            )

            setRevenue(total)
            setRequests(requestRes.data || [])

        } catch (err) {
            console.error("Error fetching data:", err)
            // Set defaults
            setProperties([])
            setTenants([])
            setRevenue(0)
            setRequests([])
        }
    }

    return (
        <div className="p-6 space-y-6">

            <h1 className="text-2xl font-bold">
                Landlord Dashboard
            </h1>

            {/* 🔥 STATS */}
            <div className="grid grid-cols-4 gap-6">

                <Card title="Properties" value={properties.length} />
                <Card title="Active Tenants" value={tenants.length} />
                <Card title="Monthly Revenue" value={`₹${revenue}`} />
                <Card title="Requests" value={requests.length} />

            </div>

            {/* 🏠 PROPERTY LIST */}
            <div>
                <h2 className="text-xl mb-3">Properties</h2>

                {properties.map((p: any) => (
                    <div key={p.id} className="glass p-4 mb-2">
                        {p.name} → ₹{p.rent}
                    </div>
                ))}
            </div>

            {/* 🔧 REQUESTS */}
            <div>
                <h2 className="text-xl mb-3">Maintenance Requests</h2>

                {requests.map((r: any) => (
                    <div key={r.id} className="glass p-4 mb-2">
                        {r.message}
                    </div>
                ))}
            </div>

        </div>
    )
}

function Card({ title, value }: any) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="glass p-6 rounded-xl"
        >
            <h2 className="text-gray-400">{title}</h2>
            <p className="text-2xl font-bold">{value}</p>
        </motion.div>
    )
}