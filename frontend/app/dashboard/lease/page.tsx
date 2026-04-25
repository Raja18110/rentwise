"use client"

import axios from "axios"
import { useState, useEffect } from "react"
import { getUser } from "@/utils/auth"

export default function Lease() {
    const [data, setData] = useState<any>({})
    const user = getUser()

    useEffect(() => {
        if (typeof window === "undefined") return

        const searchParams = new URLSearchParams(window.location.search)
        const propertyId = searchParams.get('propertyId')
        const name = searchParams.get('name')
        const rent = searchParams.get('rent')
        const landlordId = searchParams.get('landlordId')
        const landlordEmail = searchParams.get('landlordEmail')

        if (name && rent) {
            setData({
                property_id: propertyId ? Number(propertyId) : undefined,
                landlord_id: landlordId ? Number(landlordId) : undefined,
                tenant_id: user?.id,
                property_name: name,
                rent_amount: rent,
                tenant_email: user?.email || '',
                landlord_email: landlordEmail || '',
                frequency: 'monthly',
                deposit: '',
                start_date: '',
                end_date: ''
            })
        }
    }, [user])

    const createLease = async () => {
        // Validation
        if (!data.property_name || !data.tenant_email || !data.rent_amount || !data.deposit || !data.start_date || !data.end_date) {
            alert("Please fill all required fields")
            return
        }

        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "")
        try {
            const payload = {
                ...data,
                rent_amount: parseFloat(data.rent_amount),
                deposit: parseFloat(data.deposit),
                tenant_id: user?.id,
            }
            await axios.post(`${apiUrl}/lease/`, payload)
            alert("Lease created successfully!")
        } catch (err) {
            console.error(err)
            alert("Failed to create lease")
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
            <div className="glass p-8 max-w-xl w-full space-y-4">

                <h1 className="text-2xl font-bold text-white">Create Lease</h1>

                <input
                    placeholder="Property"
                    className="input"
                    value={data.property_name || ''}
                    onChange={e => setData({ ...data, property_name: e.target.value })}
                />

                <input
                    placeholder="Tenant Email"
                    className="input"
                    value={data.tenant_email || ''}
                    onChange={e => setData({ ...data, tenant_email: e.target.value })}
                />

                <input
                    placeholder="Rent"
                    className="input"
                    type="number"
                    value={data.rent_amount || ''}
                    onChange={e => setData({ ...data, rent_amount: e.target.value })}
                />

                <select
                    className="input"
                    value={data.frequency || 'monthly'}
                    onChange={e => setData({ ...data, frequency: e.target.value })}
                >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </select>

                <input
                    placeholder="Deposit"
                    className="input"
                    type="number"
                    value={data.deposit || ''}
                    onChange={e => setData({ ...data, deposit: e.target.value })}
                />

                <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                        className="input"
                        type="date"
                        value={data.start_date || ''}
                        onChange={e => setData({ ...data, start_date: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                        className="input"
                        type="date"
                        value={data.end_date || ''}
                        onChange={e => setData({ ...data, end_date: e.target.value })}
                    />
                </div>

                <button onClick={createLease} className="btn w-full">
                    Create Lease
                </button>

            </div>
        </div>
    )
}
