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

    const requestNotificationPermission = async () => {
        if (typeof window === "undefined" || !("Notification" in window)) return

        const permission = await Notification.requestPermission()
        if (permission === "granted") {
            new Notification("RentWise", {
                body: "Notifications enabled. You will now receive rent reminders and alerts.",
            })
        }
    }

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
            console.error(err)
            alert("Registration failed")
        }
    }

    const handleGoogleLogin = async (credentialResponse: any) => {
        if (!credentialResponse?.credential) {
            alert("Google sign-in did not return the required credential")
            return
        }

        try {
            const res = await axios.post(`${apiUrl}/auth/google`, {
                token: credentialResponse.credential,
                role,
            })

            if (res.data.error) {
                alert(res.data.error)
                return
            }

            localStorage.setItem("token", res.data.token)
            localStorage.setItem("role", res.data.role)
            if (res.data.username) {
                localStorage.setItem("username", res.data.username)
            }

            await requestNotificationPermission()
            router.push("/dashboard")
        } catch (err) {
            console.error(err)
            alert("Google login failed")
        }
    }

    return (
        <div className="page-shell flex items-center justify-center">

            <div className="page-card w-full max-w-md p-8">

                <div className="mb-8 text-center">
                    <p className="text-sm uppercase tracking-[0.35em] text-sky-300">Create a new account</p>
                    <h1 className="text-4xl font-bold mt-3">Register</h1>
                    <p className="text-slate-300 mt-2">Choose your role and sign up with email or Google.</p>
                </div>

                <label className="field-group">
                    <span className="text-sm text-slate-200">Email</span>
                    <input
                        type="email"
                        placeholder="name@example.com"
                        className="input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>

                <label className="field-group">
                    <span className="text-sm text-slate-200">Username</span>
                    <input
                        placeholder="Your display name"
                        className="input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </label>

                <label className="field-group">
                    <span className="text-sm text-slate-200">Password</span>
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>

                <label className="field-group">
                    <span className="text-sm text-slate-200">Role</span>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="input"
                    >
                        <option value="tenant">Tenant</option>
                        <option value="landlord">Landlord</option>
                    </select>
                </label>

                <button
                    onClick={handleRegister}
                    className="btn w-full py-3"
                >
                    Register
                </button>

                <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-4">
                        <p className="text-sm text-slate-300">Register with Google</p>
                        <p className="text-xs text-slate-500">Pick your role before the Google sign-in flow.</p>
                    </div>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="input mb-4"
                    >
                        <option value="tenant">Tenant</option>
                        <option value="landlord">Landlord</option>
                    </select>
                    <div className="flex justify-center">
                        <GoogleLogin onSuccess={handleGoogleLogin} onError={() => alert("Google sign-in failed")} />
                    </div>
                </div>

                <div className="mt-6 text-center text-slate-300 text-sm">
                    <p>
                        Already have an account? <a href="/login" className="text-cyan-300 hover:underline">Login here</a>
                    </p>
                </div>

            </div>

        </div>
    )
}