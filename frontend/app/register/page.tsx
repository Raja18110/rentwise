"use client"

import { useState } from "react"
import axios from "axios"

export default function RegisterPage() {
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [otp, setOtp] = useState("")
    const [step, setStep] = useState(1)

    // STEP 1 → Send OTP
    const sendOtp = async () => {
        try {
            await axios.post("http://localhost:8000/auth/register", {
                email,
                username,
                password
            })
            alert("OTP sent to email")
            setStep(2)
        } catch (err) {
            alert("Error sending OTP")
        }
    }

    // STEP 2 → Verify OTP
    const verifyOtp = async () => {
        try {
            await axios.post("http://localhost:8000/auth/verify-register", {
                email,
                username,
                password,
                otp
            })
            alert("Registration successful")
        } catch (err) {
            alert("Invalid OTP")
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-100">

            <div className="bg-white p-6 rounded-xl shadow-md w-80">

                <h1 className="text-xl font-bold mb-4 text-center">
                    Register
                </h1>

                {/* STEP 1 FORM */}
                {step === 1 && (
                    <>
                        <input
                            placeholder="Email"
                            className="border p-2 w-full mb-2"
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <input
                            placeholder="Username"
                            className="border p-2 w-full mb-2"
                            onChange={(e) => setUsername(e.target.value)}
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            className="border p-2 w-full mb-2"
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button
                            onClick={sendOtp}
                            className="bg-blue-500 text-white w-full p-2 rounded"
                        >
                            Send OTP
                        </button>
                    </>
                )}

                {/* STEP 2 FORM */}
                {step === 2 && (
                    <>
                        <input
                            placeholder="Enter OTP"
                            className="border p-2 w-full mb-2"
                            onChange={(e) => setOtp(e.target.value)}
                        />

                        <button
                            onClick={verifyOtp}
                            className="bg-green-500 text-white w-full p-2 rounded"
                        >
                            Verify & Register
                        </button>
                    </>
                )}

            </div>
        </div>
    )
}