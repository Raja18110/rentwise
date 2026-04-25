"use client"

import { useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

export default function GoogleSuccess() {

    const router = useRouter()



    useEffect(() => {
        const credential = localStorage.getItem("google_token")

        if (!credential) {
            router.push("/login")
            return
        }

        const loginToBackend = async () => {
            try {
                const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "")
                const res = await axios.post(`${apiUrl}/auth/google`, {
                    token: credential,
                })

                localStorage.setItem("token", res.data.token)
                localStorage.setItem("role", res.data.role)

                router.push("/dashboard")
            } catch (err) {
                console.error(err)
                router.push("/login")
            }
        }

        loginToBackend()
    }, [])

    return (
        <div className="page-shell flex items-center justify-center">
            <div className="page-card p-8 max-w-md w-full text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-sky-300">Google Sign-In</p>
                <h1 className="text-4xl font-bold mt-3">Finishing sign-in</h1>
                <p className="text-slate-300 mt-4">Your Google account is being validated and your RentWise session is being created.</p>
            </div>
        </div>
    )
}
