"use client"

import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { getUser } from "@/utils/auth"

export default function Requests() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const user = useMemo(() => getUser(), [])
    const [leases, setLeases] = useState<any[]>([])
    const [selectedLeaseId, setSelectedLeaseId] = useState("")
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [priority, setPriority] = useState("normal")

    useEffect(() => {
        if (!user?.email || typeof window === "undefined") return

        const searchParams = new URLSearchParams(window.location.search)
        const leaseId = searchParams.get("leaseId")
        if (leaseId) setSelectedLeaseId(leaseId)

        axios.get(`${apiUrl}/lease/tenant/${encodeURIComponent(user.email)}`)
            .then((res) => setLeases(res.data?.data || []))
            .catch((err) => {
                console.error(err)
                setLeases([])
            })
    }, [apiUrl, user])

    const selectedLease = leases.find((lease) => String(lease.id) === selectedLeaseId)

    const submitRequest = async () => {
        if (!selectedLease) {
            alert("Please choose the lease/property for this request.")
            return
        }

        if (!description.trim()) {
            alert("Please describe the issue.")
            return
        }

        try {
            await axios.post(`${apiUrl}/request`, {
                lease_id: selectedLease.id,
                property_id: selectedLease.property_id,
                tenant_id: user?.id,
                landlord_id: selectedLease.landlord_id,
                tenant_email: user?.email,
                landlord_email: selectedLease.landlord_email,
                title: title || "Maintenance request",
                message: description,
                priority,
                request_type: "maintenance",
            })
            alert("Request submitted")
            setTitle("")
            setDescription("")
            setPriority("normal")
        } catch (err) {
            console.error(err)
            alert("Request failed")
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
            <div className="glass p-8 max-w-md w-full space-y-4">
                <h2 className="text-2xl font-bold text-white">Maintenance Request</h2>

                {leases.length === 0 ? (
                    <p className="text-gray-400">No lease found for this tenant account.</p>
                ) : (
                    <select
                        className="input"
                        value={selectedLeaseId}
                        onChange={(e) => setSelectedLeaseId(e.target.value)}
                    >
                        <option value="">Select lease</option>
                        {leases.map((lease) => (
                            <option key={lease.id} value={lease.id}>
                                {lease.property_name}
                            </option>
                        ))}
                    </select>
                )}

                <input
                    className="input"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                    className="input"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <select
                    className="input"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                </select>

                <button
                    onClick={submitRequest}
                    className="btn w-full"
                    disabled={!selectedLease}
                >
                    Submit
                </button>
            </div>
        </div>
    )
}
