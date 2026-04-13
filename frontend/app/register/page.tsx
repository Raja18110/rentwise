"use client"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { GoogleLogin } from "@react-oauth/google"

export default function RegisterPage() {
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("tenant")

    const router = useRouter()

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    const handleRegister = async () => {
        if (!email.trim() || !username.trim() || !password.trim()) {
            alert("Please fill in email, username, and password")
            return
        }

        try {
            await axios.post(`${apiUrl}/auth/register`, {
                email,
                username,
                password,
                role,
            })

            alert("Registration successful")

            router.push("/login")

        } catch (err) {
            alert("Registration failed")
        }
    }
    const handleGoogleLogin = async (credentialResponse: any) => {
        try {
            const res = await axios.post(
                `${apiUrl}/auth/google`,
                {
                    token: credentialResponse.credential
                }
            )

            localStorage.setItem("token", res.data.token)
            localStorage.setItem("role", res.data.role)
            if (res.data.username) {
                localStorage.setItem("username", res.data.username)
            }

            router.push("/dashboard")

        } catch (err) {
            alert("Google login failed")
        }
    }

    return (
        <div className="flex h-screen items-center justify-center">

            <div className="glass p-8 w-96">

                <h1 className="text-xl font-bold mb-4 text-center">
                    Register
                </h1>

                <input
                    placeholder="Email"
                    className="input mb-3"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    placeholder="Username"
                    className="input mb-3"
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="input mb-3"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="input mb-3"
                >
                    <option value="tenant">Tenant</option>
                    <option value="landlord">Landlord</option>
                </select>

                <button
                    onClick={handleRegister}
                    className="btn w-full"
                >
                    Register
                </button>
                <GoogleLogin onSuccess={handleGoogleLogin} />

            </div>

        </div>
    )
}