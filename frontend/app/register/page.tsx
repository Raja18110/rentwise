"use client"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("tenant")

    const router = useRouter()

    const handleRegister = async () => {
        try {
            await axios.post("http://127.0.0.1:8000/auth/register", {
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

            </div>

        </div>
    )
}