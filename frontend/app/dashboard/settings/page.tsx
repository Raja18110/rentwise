"use client"

import { useState } from "react"
import axios from "axios"

export default function Settings() {
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [newValue, setNewValue] = useState("")
    const [mode, setMode] = useState("")

    const userId = 1 // replace later with JWT decode

    const sendOtp = async () => {
        await axios.post("process.env.NEXT_PUBLIC_API_URL/auth/send-otp", { email })
        alert("OTP sent")
    }

    const verifyAndUpdate = async () => {
        const verify = await axios.post(
            "process.env.NEXT_PUBLIC_API_URL/auth/verify-otp",
            { email, otp }
        )

        if (verify.data.message) {

            if (mode === "email") {
                await axios.put("process.env.NEXT_PUBLIC_API_URL/user/update-email", {
                    user_id: userId,
                    new_email: newValue
                })
            }

            if (mode === "username") {
                await axios.put("process.env.NEXT_PUBLIC_API_URL/user/update-username", {
                    user_id: userId,
                    username: newValue
                })
            }

            if (mode === "password") {
                await axios.put("process.env.NEXT_PUBLIC_API_URL/user/update-password", {
                    user_id: userId,
                    password: newValue
                })
            }

            alert("Updated successfully")
        }
    }

    return (
        <div className="p-6">

            <div className="glass p-6 max-w-md mx-auto">

                <h2 className="text-xl mb-4">Settings</h2>

                <input
                    className="input mb-3"
                    placeholder="Your Email"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button onClick={sendOtp} className="btn w-full mb-3">
                    Send OTP
                </button>

                <input
                    className="input mb-3"
                    placeholder="Enter OTP"
                    onChange={(e) => setOtp(e.target.value)}
                />

                <select
                    className="input mb-3"
                    onChange={(e) => setMode(e.target.value)}
                >
                    <option>Select Action</option>
                    <option value="email">Change Email</option>
                    <option value="username">Change Username</option>
                    <option value="password">Change Password</option>
                </select>

                <input
                    className="input mb-3"
                    placeholder="New Value"
                    onChange={(e) => setNewValue(e.target.value)}
                />

                <button onClick={verifyAndUpdate} className="btn w-full">
                    Update
                </button>

            </div>

        </div>
    )
}