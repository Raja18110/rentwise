"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

export default function GoogleSuccess() {
    const { data: session } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (session?.user?.email) {
            loginToBackend(session.user.email)
        }
    }, [session])

    const loginToBackend = async (email: string) => {
        try {
            const res = await axios.post(
                "http://127.0.0.1:8000/auth/google",
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