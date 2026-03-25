"use client"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
const router = useRouter()

// after login success:
router.push("/dashboard")

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleLogin = async () => {
        try {
            const res = await axios.post("http://localhost:8000/auth/login", {
                email: email,
                password: password
            })

            console.log(res.data)

            // Save token & role
            localStorage.setItem("token", res.data.token)
            localStorage.setItem("role", res.data.role)

            alert("Login Successful")

        } catch (err) {
            alert("Login Failed")
            console.error(err)
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
            </div>

        </div>
    )
}