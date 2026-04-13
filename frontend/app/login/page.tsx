"use client"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { GoogleLogin } from "@react-oauth/google"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    // 🔐 Normal login
    const handleLogin = async () => {
        if (!email || !password) {
            alert("Please enter both email and password")
            return
        }

        try {
            const res = await axios.post(`${apiUrl}/auth/login`, {
                email,
                password,
            })

            if (res.data.error) {
                alert(res.data.error)
                return
            }

            if (!res.data.token) {
                alert("Login failed: missing token")
                return
            }

            localStorage.setItem("token", res.data.token)
            localStorage.setItem("role", res.data.role)
            if (res.data.username) {
                localStorage.setItem("username", res.data.username)
            }

            alert("Login Successful")
            router.push("/dashboard")

        } catch (err) {
            console.error(err)
            alert("Login Failed")
        }
    }

    // 🔥 Google login
    const handleGoogleLogin = async (credentialResponse: any) => {
        try {
            const res = await axios.post(
                `${apiUrl}/auth/google`,
                {
                    token: credentialResponse.credential,
                }
            )

            if (res.data.error) {
                alert(res.data.error)
                return
            }

            if (!res.data.token) {
                alert("Google login failed: missing token")
                return
            }

            localStorage.setItem("token", res.data.token)
            localStorage.setItem("role", res.data.role)
            if (res.data.username) {
                localStorage.setItem("username", res.data.username)
            }

            alert("Google Login Success")
            router.push("/dashboard")

        } catch (err) {
            console.error(err)
            alert("Google Login Failed")
        }
    }

    return (
        <div className="flex h-screen items-center justify-center">

            <div className="glass p-8 w-96">

                <h1 className="text-xl font-bold mb-4 text-center">
                    Login
                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="input mb-3"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="input mb-3"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    className="btn w-full"
                >
                    Login
                </button>

                <div className="mt-4 flex justify-center">
                    <GoogleLogin onSuccess={handleGoogleLogin} />
                </div>

                <div className="mt-4 text-center">
                    <p className="text-sm">
                        Don't have an account?{" "}
                        <a href="/register" className="text-blue-400 hover:underline">
                            Register here
                        </a>
                    </p>
                </div>

            </div>

        </div>
    )
}