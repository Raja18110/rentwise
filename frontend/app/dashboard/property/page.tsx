"use client"

import { useState } from "react"
import axios from "axios"
import API from "@/utils/api"
import { getUser } from "@/utils/auth"

export default function PropertyPage() {
    const [data, setData] = useState<any>({})

    const createProperty = async () => {
        const user = getUser()
        if (!user) {
            alert("Please login first")
            return
        }

        if (!data.name || !data.location || !data.rent) {
            alert("Please fill all fields")
            return
        }

        try {
            await axios.post(`${API}/property`, {
                ...data,
                landlord_id: user.id
            })
            alert("Property Added Successfully!")
            setData({})
        } catch (err) {
            console.error(err)
            alert("Failed to add property")
        }
    }

    return (
        <div className="p-6 max-w-xl mx-auto space-y-3">

            <h1 className="text-xl font-bold">Add Property</h1>

            <input placeholder="Property Name"
                className="input"
                onChange={e => setData({ ...data, name: e.target.value })}
            />

            <input placeholder="Location"
                className="input"
                onChange={e => setData({ ...data, location: e.target.value })}
            />

            <input placeholder="Rent Amount"
                className="input"
                type="number"
                onChange={e => setData({ ...data, rent: parseFloat(e.target.value) || 0 })}
            />

            <button
                onClick={createProperty}
                className="btn"
            >
                Add Property
            </button>

        </div>
    )
}