"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import API from "@/utils/api"
import { motion } from "framer-motion"
import { getUser } from "@/utils/auth"

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const u = getUser()
        if (!u) {
            router.push("/login")
            return
        }
        setUser(u)
    }, [router])

    if (!user) return <div className="flex min-h-screen items-center justify-center">Loading...</div>

    return (
        <div className="p-6">
            {user.role === "landlord" ? (
                <LandlordDashboard />
            ) : (
                <TenantDashboard user={user} />
            )}
        </div>
    )
}

function LandlordDashboard() {
    const [user, setUser] = useState<any>(null)
    const [properties, setProperties] = useState<any[]>([])
    const [tenants, setTenants] = useState<any[]>([])
    const [requests, setRequests] = useState<any[]>([])
    const [revenue, setRevenue] = useState(0)
    const [leases, setLeases] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const currentUser = getUser()
        if (!currentUser) {
            router.push("/login")
            return
        }
        setUser(currentUser)
        fetchData(currentUser)
    }, [router])

    const fetchData = async (currentUser: any) => {
        try {
            setLoading(true)
            const landlordEmail = currentUser.email

            const [propertyRes, leaseRes, paymentRes, requestRes] = await Promise.all([
                axios.get(`${API}/property/landlord/${currentUser.id}`),
                axios.get(`${API}/lease/landlord/${encodeURIComponent(landlordEmail)}`),
                axios.get(`${API}/payment`),
                axios.get(`${API}/request/landlord/${encodeURIComponent(landlordEmail)}`)
            ])

            const properties = propertyRes.data?.data || []
            const leases = leaseRes.data?.data || []
            const payments = paymentRes.data?.data || []
            const requests = requestRes.data?.data || []

            setProperties(properties)
            setLeases(leases)

            // Filter active leases
            const activeTenants = leases.filter((l: any) => l.status === "active")
            setTenants(activeTenants)

            // Calculate total revenue from this landlord's payments
            const total = payments.reduce((sum: number, p: any) => {
                if (p.landlord_email === landlordEmail) {
                    return sum + (p.amount || 0)
                }
                return sum
            }, 0)
            setRevenue(total)

            setRequests(requests)
        } catch (err) {
            console.error("Error fetching data:", err)
            setProperties([])
            setTenants([])
            setRevenue(0)
            setRequests([])
            setLeases([])
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>

    const updateLeaseStatus = async (leaseId: number, status: string) => {
        try {
            await axios.put(`${API}/lease/${leaseId}`, { status })
            alert("Lease status updated!")
            if (user) fetchData(user)
        } catch (err) {
            console.error(err)
            alert("Failed to update lease status")
        }
    }

    const handleLeaseChat = (lease: any) => {
        router.push(`/dashboard/chat?leaseId=${lease.id}&tenantEmail=${encodeURIComponent(lease.tenant_email || "")}`)
    }

    return (
        <div className="space-y-8">
            <div className="glass p-6 rounded-3xl">
                <h1 className="text-2xl font-bold">Landlord Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                    <Card title="Properties" value={properties.length} />
                    <Card title="Active Tenants" value={tenants.length} />
                    <Card title="Monthly Revenue" value={`₹${revenue}`} />
                    <Card title="Requests" value={requests.length} />
                </div>
            </div>

            <div className="glass p-6 rounded-3xl">
                <h2 className="text-xl mb-3">🏠 Properties</h2>
                {properties.length === 0 ? (
                    <p className="text-gray-400">No properties yet. <a href="/dashboard/property" className="text-blue-400 underline">Create one</a></p>
                ) : (
                    properties.map((p: any) => (
                        <div key={p.id} className="glass p-4 mb-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">{p.name}</h3>
                                    <p className="text-sm text-gray-400">{p.location}</p>
                                    <p className="text-sm">₹{p.rent}/month</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-sm ${p.status === "available" ? "bg-green-500/20" : "bg-red-500/20"}`}>
                                    {p.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="glass p-6 rounded-3xl">
                <h2 className="text-xl mb-3">📋 Manage Leases</h2>
                {leases.length === 0 ? (
                    <p className="text-gray-400">No leases yet</p>
                ) : (
                    leases.map((l: any) => (
                        <div key={l.id} className="glass p-4 mb-3 flex justify-between items-center gap-4">
                            <div>
                                <p className="font-bold">{l.property_name}</p>
                                <p className="text-sm text-gray-400">{l.tenant_email}</p>
                                <p className="text-sm">₹{l.rent_amount} ({l.frequency})</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleLeaseChat(l)}
                                    className="btn-secondary text-sm px-3 py-1"
                                >
                                    Chat
                                </button>
                                <select
                                    value={l.status}
                                    onChange={(e) => updateLeaseStatus(l.id, e.target.value)}
                                    className="input w-32"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="active">Active</option>
                                    <option value="expired">Expired</option>
                                    <option value="terminated">Terminated</option>
                                </select>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="glass p-6 rounded-3xl">
                <h2 className="text-xl mb-3">🔧 Maintenance Requests</h2>
                {requests.length === 0 ? (
                    <p className="text-gray-400">No requests yet</p>
                ) : (
                    requests.map((r: any) => (
                        <div key={r.id} className="glass p-4 mb-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{r.title || r.message}</p>
                                    <p className="text-sm text-gray-400">From: {r.tenant_email}</p>
                                    <p className="text-sm">{r.message}</p>
                                </div>
                                <span className={`px-2 py-1 rounded text-sm whitespace-nowrap ml-4 ${r.status === "pending" ? "bg-yellow-500/20" : r.status === "resolved" ? "bg-green-500/20" : "bg-blue-500/20"}`}>
                                    {r.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

function TenantDashboard({ user }: any) {
    const router = useRouter()
    const [properties, setProperties] = useState<any[]>([])
    const [leases, setLeases] = useState<any[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [user])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [propertyRes, leaseRes] = await Promise.all([
                axios.get(`${API}/property`),
                axios.get(`${API}/lease/tenant/${encodeURIComponent(user.email)}`)
            ])

            setProperties(propertyRes.data?.data || propertyRes.data || [])
            setLeases(leaseRes.data?.data || leaseRes.data || [])
        } catch (err) {
            console.error("Error fetching data:", err)
            setProperties([])
            setLeases([])
        } finally {
            setLoading(false)
        }
    }

    const handleLease = (property: any) => {
        // Navigate to lease page with property details
        router.push(`/dashboard/lease?propertyId=${property.id}&name=${encodeURIComponent(property.name)}&location=${encodeURIComponent(property.location)}&rent=${property.rent}&landlordId=${property.landlord_id}&landlordEmail=${encodeURIComponent(property.landlord_email || "")}`)
    }

    const handleChat = (lease: any) => {
        router.push(`/dashboard/chat?leaseId=${lease.id}&landlordEmail=${encodeURIComponent(lease.landlord_email)}`)
    }

    const handlePayment = (lease: any) => {
        router.push(`/dashboard/payments?leaseId=${lease.id}&amount=${lease.rent_amount}&landlordEmail=${encodeURIComponent(lease.landlord_email)}`)
    }

    const handleRequest = (lease: any) => {
        router.push(`/dashboard/requests?leaseId=${lease.id}&propertyId=${lease.property_id}`)
    }

    const filteredProperties = properties.filter((p: any) =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.location?.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>

    return (
        <div className="space-y-8">
            <div className="glass p-6 rounded-3xl">
                <h1 className="text-2xl font-bold">Tenant Dashboard</h1>
                <p className="text-gray-400 mt-2">Welcome, {user.username}</p>
            </div>

            <div className="glass p-6 rounded-3xl">
                <h2 className="text-xl mb-3">🔍 Search Properties</h2>
                <input
                    type="text"
                    placeholder="Search by name or location..."
                    className="input mb-4 w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {filteredProperties.length === 0 ? (
                    <p className="text-gray-400">No properties found</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProperties.map((p: any) => (
                            <div key={p.id} className="glass p-4">
                                <h3 className="font-bold mb-2">{p.name}</h3>
                                <p className="text-sm text-gray-400 mb-1">📍 {p.location}</p>
                                <p className="text-sm mb-2">💰 ₹{p.rent}/month</p>
                                {p.bhk && <p className="text-sm text-gray-400">{p.bhk}</p>}
                                <button
                                    onClick={() => handleLease(p)}
                                    className="btn mt-3 w-full"
                                >
                                    Create Lease
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="glass p-6 rounded-3xl">
                <h2 className="text-xl mb-3">📋 My Leases</h2>
                {leases.length === 0 ? (
                    <p className="text-gray-400">No active leases. Search and create one above.</p>
                ) : (
                    leases.map((l: any) => (
                        <div key={l.id} className="glass p-4 mb-3">
                            <div className="mb-3">
                                <p className="font-bold text-lg">{l.property_name}</p>
                                <p className="text-sm text-gray-400">Landlord: {l.landlord_email}</p>
                                <p className="text-sm">💰 ₹{l.rent_amount}/{l.frequency}</p>
                                <p className="text-sm">Status: <span className={`px-2 py-1 rounded ${l.status === "active" ? "bg-green-500/20" : "bg-yellow-500/20"}`}>{l.status}</span></p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => handlePayment(l)}
                                    className="btn-secondary text-sm px-3 py-1"
                                >
                                    💳 Pay Rent
                                </button>
                                <button
                                    onClick={() => handleRequest(l)}
                                    className="btn-secondary text-sm px-3 py-1"
                                >
                                    🔧 Request Service
                                </button>
                                <button
                                    onClick={() => handleChat(l)}
                                    className="btn-secondary text-sm px-3 py-1"
                                >
                                    💬 Chat
                                </button>
                            </div>
                        </div>
                    ))
                )}
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
