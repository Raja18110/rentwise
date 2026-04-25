"use client"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { GoogleLogin } from "@react-oauth/google"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

export default function RegisterPage() {
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("tenant")
    const [loading, setLoading] = useState(false)

    const router = useRouter()

    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "")

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
            toast.error("Please fill in email, username, and password")
            return
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        try {
            setLoading(true)
            await axios.post(`${apiUrl}/auth/register`, {
                email,
                username,
                password,
                role,
            })

            toast.success("Registration successful! Redirecting to login...")
            router.push("/login")
        } catch (err: any) {
            console.error(err)
            const errorMsg = err.response?.data?.error || err.response?.data?.detail || err.message || "Registration failed"
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async (credentialResponse: any) => {
        if (!credentialResponse?.credential) {
            toast.error("Google sign-in did not return the required credential")
            return
        }

        try {
            setLoading(true)
            const res = await axios.post(`${apiUrl}/auth/google`, {
                token: credentialResponse.credential,
                role,
            })

            if (res.data.error) {
                toast.error(res.data.error)
                return
            }

            localStorage.setItem("token", res.data.token)
            localStorage.setItem("role", res.data.role)
            if (res.data.username) {
                localStorage.setItem("username", res.data.username)
            }

            toast.success("Google registration successful! Redirecting...")
            await requestNotificationPermission()
            router.push("/dashboard")
        } catch (err: any) {
            console.error(err)
            const errorMsg = err.response?.data?.error || err.response?.data?.detail || err.message || "Google login failed"
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleError = () => {
        toast.error("Google sign-in failed. Please try again.")
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="page-shell flex items-center justify-center"
        >

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="page-card w-full max-w-md p-8"
            >

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
                        disabled={loading}
                    />
                </label>

                <label className="field-group">
                    <span className="text-sm text-slate-200">Username</span>
                    <input
                        placeholder="Your display name"
                        className="input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
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
                        disabled={loading}
                    />
                    <p className="text-xs text-slate-400 mt-1">Minimum 6 characters</p>
                </label>

                <label className="field-group">
                    <span className="text-sm text-slate-200">Role</span>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="input"
                        disabled={loading}
                    >
                        <option value="tenant">Tenant</option>
                        <option value="landlord">Landlord</option>
                    </select>
                </label>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRegister}
                    disabled={loading}
                    className="btn w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Registering..." : "Register"}
                </motion.button>

                <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="mb-4">
                        <p className="text-sm text-slate-300">Register with Google</p>
                        <p className="text-xs text-slate-500">Pick your role before the Google sign-in flow.</p>
                    </div>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="input mb-4"
                        disabled={loading}
                    >
                        <option value="tenant">Tenant</option>
                        <option value="landlord">Landlord</option>
                    </select>
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleLogin}
                            onError={handleGoogleError}
                        />
                    </div>
                </div>

                <div className="mt-6 text-center text-slate-300 text-sm">
                    <p>
                        Already have an account? <a href="/login" className="text-cyan-300 hover:underline">Login here</a>
                    </p>
                </div>

            </motion.div>

        </motion.div>
    )
}
