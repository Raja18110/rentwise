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
    const [properties, setProperties] = useState<any[]>([])
    const [tenants, setTenants] = useState<any[]>([])
    const [requests, setRequests] = useState<any[]>([])
    const [revenue, setRevenue] = useState(0)
    const [leases, setLeases] = useState<any[]>([])

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
            setLeases(leaseRes.data || [])
        } catch (err) {
            console.error("Error fetching data:", err)
            setProperties([])
            setTenants([])
            setRevenue(0)
            setRequests([])
            setLeases([])
        }
    }

    const updateLeaseStatus = async (leaseId: number, status: string) => {
        try {
            await axios.put(`${API}/lease/${leaseId}`, { status })
            alert("Lease status updated!")
            fetchData() // Refresh data
        } catch (err) {
            console.error(err)
            alert("Failed to update lease status")
        }
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
                <h2 className="text-xl mb-3">Properties</h2>
                {properties.map((p: any) => (
                    <div key={p.id} className="glass p-4 mb-3">
                        {p.name} → ₹{p.rent}
                    </div>
                ))}
            </div>

            <div className="glass p-6 rounded-3xl">
                <h2 className="text-xl mb-3">Maintenance Requests</h2>
                {requests.map((r: any) => (
                    <div key={r.id} className="glass p-4 mb-3">
                        {r.message}
                    </div>
                ))}
            </div>

            <div className="glass p-6 rounded-3xl">
                <h2 className="text-xl mb-3">Manage Leases</h2>
                {leases.map((l: any) => (
                    <div key={l.id} className="glass p-4 mb-3 flex justify-between items-center">
                        <div>
                            {l.property_name} → {l.tenant_email} ({l.status})
                        </div>
                        <select
                            value={l.status}
                            onChange={(e) => updateLeaseStatus(l.id, e.target.value)}
                            className="input w-32"
                        >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                ))}
            </div>
        </div>
    )
}

function TenantDashboard({ user }: any) {
    const router = useRouter()
    const [properties, setProperties] = useState<any[]>([])
    const [leases, setLeases] = useState<any[]>([])
    const [search, setSearch] = useState("")

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [propertyRes, leaseRes] = await Promise.all([
                axios.get(`${API}/property`),
                axios.get(`${API}/lease`)
            ])

            setProperties(propertyRes.data || [])
            setLeases((leaseRes.data || []).filter((l: any) => l.tenant_email === user.email))
        } catch (err) {
            console.error(err)
            setProperties([])
            setLeases([])
        }
    }

    const handleLease = (property: any) => {
        // Navigate to lease page with property details
        router.push(`/dashboard/lease?propertyId=${property.id}&name=${encodeURIComponent(property.name)}&location=${encodeURIComponent(property.location)}&rent=${property.rent}`)
    }

    const filteredProperties = properties.filter((p: any) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-8">
            <div className="glass p-6 rounded-3xl">
                <h1 className="text-2xl font-bold">Tenant Dashboard</h1>
            </div>

            <div className="glass p-6 rounded-3xl">
                <h2 className="text-xl mb-3">Search Properties</h2>
                <input
                    type="text"
                    placeholder="Search by name or location..."
                    className="input mb-4"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredProperties.map((p: any) => (
                        <div key={p.id} className="glass p-4">
                            <h3 className="font-bold">{p.name}</h3>
                            <p>Location: {p.location}</p>
                            <p>Rent: ₹{p.rent}</p>
                            <button
                                onClick={() => handleLease(p)}
                                className="btn mt-2"
                            >
                                Lease Property
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass p-6 rounded-3xl">
                <h2 className="text-xl mb-3">My Leases</h2>
                {leases.length === 0 ? (
                    <p>No leases found</p>
                ) : (
                    leases.map((l: any) => (
                        <div key={l.id} className="glass p-4 mb-3">
                            {l.property_name} → ₹{l.rent_amount} ({l.status})
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