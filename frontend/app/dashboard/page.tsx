"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getUser } from "../../utils/auth"
import axios from "axios"

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null)
    const [leases, setLeases] = useState([])
    const [payments, setPayments] = useState([])
    const [notifications, setNotifications] = useState<any[]>([])

    useEffect(() => {
        const u = getUser()
        setUser(u)

        axios.get("http://127.0.0.1:8000/lease")
            .then(res => setLeases(res.data))
            .catch(err => console.error(err))

        axios.get("http://127.0.0.1:8000/payment")
            .then(res => {
                if (u) {
                    const filtered = res.data.filter(
                        (p: any) => p.email === u.email
                    )
                    setPayments(filtered)
                }
            })
            .catch(err => console.error(err))
        axios.get("http://127.0.0.1:8000/notification/" + user.email)
            .then(res => setNotifications(res.data))
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
                <TenantDashboard leases={leases} />
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
            <div className="glass p-4 mb-6">
                <h2 className="mb-2">Notifications 🔔</h2>

                {notifications.length === 0 ? (
                    <p>No notifications</p>
                ) : (
                    notifications.map((n: any) => (
                        <div key={n.id} className="flex justify-between mb-2">

                            <span>{n.message}</span>

                            {n.status === "unread" && (
                                <button
                                    onClick={async () => {
                                        await axios.put(`http://127.0.0.1:8000/notification/read/${n.id}`)
                                        window.location.reload()
                                    }}
                                    className="text-blue-400 text-sm"
                                >
                                    Mark Read
                                </button>
                            )}

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

function TenantDashboard({ leases }: any) {
    return (
        <div>
            <h2 className="text-xl mb-4">Tenant Dashboard</h2>

            {leases.map((l: any) => (
                <div key={l.id} className="glass p-4 mb-2">
                    {l.property_name} → ₹{l.rent_amount} ({l.status})

                    <button
                        onClick={() => handlePayment(l.rent_amount, "rent")}
                        className="bg-green-600 text-white px-3 py-1 ml-2"
                    >
                        Pay Rent
                    </button>
                </div>
            ))}
        </div>
    )
}
function Card({ title, value }: any) {
    return (
        <motion.div
            whileHover={{ scale: 1.08 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 shadow-xl"
        >
            <h2 className="text-gray-300">{title}</h2>
            <p className="text-3xl font-bold mt-2">{value}</p>
        </motion.div>
    )
}
const handlePayment = async (amount: number, type: string) => {
    const user = JSON.parse(localStorage.getItem("token") || "{}")

    await axios.post("http://127.0.0.1:8000/payment", {
        email: user.email,
        amount,
        type
    })

    alert("Payment Successful ✅")
}