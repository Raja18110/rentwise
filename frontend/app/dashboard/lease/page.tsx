"use client"

import axios from "axios"
import { useState } from "react"

export default function Lease() {
    const [data, setData] = useState<any>({})

    const createLease = async () => {
        await axios.post("process.env.NEXT_PUBLIC_API_URL/lease", data)
        alert("Lease created")
    }

    return (
        <div className="p-6 max-w-xl mx-auto space-y-2">

            <h1 className="text-xl font-bold">Create Lease</h1>

            <input placeholder="Property"
                onChange={e => setData({ ...data, property_name: e.target.value })}
            />

            <input placeholder="Tenant Email"
                onChange={e => setData({ ...data, tenant_email: e.target.value })}
            />

            <input placeholder="Rent"
                onChange={e => setData({ ...data, rent_amount: e.target.value })}
            />

            <select onChange={e => setData({ ...data, frequency: e.target.value })}>
                <option>monthly</option>
                <option>yearly</option>
            </select>

            <input placeholder="Deposit"
                onChange={e => setData({ ...data, deposit: e.target.value })}
            />

            <button onClick={createLease} className="bg-blue-600 text-white px-4 py-2">
                Create Lease
            </button>
            <input placeholder="Start Date"
                onChange={e => setData({ ...data, start_date: e.target.value })}
            />

            <input placeholder="End Date"
                onChange={e => setData({ ...data, end_date: e.target.value })}
            />

            <select onChange={e => setData({ ...data, status: e.target.value })}>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
            </select>

        </div>
    )
}