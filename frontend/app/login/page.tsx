"use client"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { GoogleLogin } from "@react-oauth/google"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()

    // 🔐 Normal login
    const handleLogin = async () => {
        try {
            const res = await axios.post("http://127.0.0.1:8000/auth/login", {
                email,
                password
            })

            localStorage.setItem("token", res.data.token)
            localStorage.setItem("role", res.data.role)

            alert("Login Successful")
            router.push("/dashboard")

        } catch (err) {
            alert("Login Failed")
        }
    }

    // 🔥 Google login (NEW)
    const handleGoogleLogin = async (credentialResponse: any) => {
        try {
            const res = await axios.post(
                "http://127.0.0.1:8000/auth/google",
                {
                    token: credentialResponse.credential
                }
            )

            localStorage.setItem("token", res.data.token)
            localStorage.setItem("role", res.data.role)

            alert("Google Login Success")
            router.push("/dashboard")

        } catch (err) {
            alert("Google Login Failed")
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">

            <div className="bg-white p-6 rounded-xl shadow-md w-80">

                <h1 className="text-xl font-bold mb-4 text-center">
                    Login
                </h1>

                <input
                    type="email"
                    placeholder="Email"
                    className="border p-2 w-full mb-3"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="border p-2 w-full mb-3"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    className="bg-blue-500 text-white w-full p-2 rounded"
                >
                    Login
                </button>

                {/* 🔥 GOOGLE LOGIN BUTTON */}
                <div className="mt-4 flex justify-center">
                    <GoogleLogin onSuccess={handleGoogleLogin} />
                </div>

            </div>

        </div>
    )
}