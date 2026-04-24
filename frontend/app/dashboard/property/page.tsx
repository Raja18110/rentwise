"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import API from "@/utils/api"
import { getUser } from "@/utils/auth"

export default function PropertyPage() {
    const [data, setData] = useState<any>({})
    const [properties, setProperties] = useState<any[]>([])
    useEffect(() => {
        fetchProperties()
    }, [])

    const fetchProperties = async () => {
        try {
            const res = await axios.get(`${API}/property`)
            setProperties(res.data.data || [])
        } catch (err) {
            console.error(err)
        }
    }

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
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
            <div className="glass p-8 max-w-xl w-full space-y-4">

                <h1 className="text-2xl font-bold text-white">Add Property</h1>

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
        </div>
    )
}