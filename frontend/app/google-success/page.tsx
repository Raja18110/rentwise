"use client"

import { useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

export default function GoogleSuccess() {

    const router = useRouter()



    const loginToBackend = async (email: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
            const res = await axios.post(
                `${apiUrl}/auth/google`,
                { email }
            )

            localStorage.setItem("token", res.data.token)
            localStorage.setItem("role", res.data.role)

            router.push("/dashboard")
        } catch (err) {
            console.error(err)
        }
    }

    return <div className="p-6">Logging in with Google...</div>
}