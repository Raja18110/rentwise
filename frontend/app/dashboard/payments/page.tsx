"use client"

import axios from "axios"
import { useState } from "react"
import { getUser } from "@/utils/auth"

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js"

function loadRazorpay(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof window === "undefined") {
            reject(new Error("Window is not defined"))
            return
        }

        if ((window as any).Razorpay) {
            resolve()
            return
        }

        const script = document.createElement("script")
        script.src = RAZORPAY_SCRIPT
        script.async = true
        script.onload = () => resolve()
        script.onerror = () => reject(new Error("Failed to load Razorpay SDK"))
        document.body.appendChild(script)
    })
}

export default function Payments() {

    const [loading, setLoading] = useState(false)

    const handlePayment = async () => {
        setLoading(true)

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
            const user = getUser()

            if (!user?.email) {
                alert("Please log in to make a payment.")
                setLoading(false)
                return
            }

            const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY || ""
            const canUseRazorpay = razorpayKey && razorpayKey !== "YOUR_RAZORPAY_KEY"

            if (!canUseRazorpay) {
                await axios.post(`${apiUrl}/payment`, {
                    email: user.email,
                    amount: 5000,
                    type: "rent",
                })
                alert("Payment recorded successfully in test mode.")
                setLoading(false)
                return
            }

            await loadRazorpay()

            const { data } = await axios.post(
                `${apiUrl}/payment/create-order`,
                { amount: 5000 }
            )

            if (!data || !data.id || !data.amount) {
                throw new Error("Invalid order response")
            }

            const options = {
                key: razorpayKey,
                amount: data.amount,
                currency: "INR",
                name: "RentWise",
                order_id: data.id,
                handler: function (response: any) {
                    axios.post(`${apiUrl}/payment`, {
                        email: user.email,
                        amount: 5000,
                        type: "rent",
                    })
                        .then(() => {
                            alert("Payment Successful")
                        })
                        .catch((err) => {
                            console.error(err)
                            alert("Payment completed, but failed to save transaction.")
                        })
                },
                prefill: {
                    name: user.username || "",
                    email: user.email,
                },
                theme: {
                    color: "#2563eb",
                },
            }

            const Razorpay = (window as any).Razorpay
            if (!Razorpay) {
                throw new Error("Razorpay is not available")
            }

            const rzp = new Razorpay(options)
            rzp.open()

        } catch (err) {
            console.error(err)
            alert("Payment failed. Please refresh and try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6">

            <div className="glass p-6">

                <h2 className="text-xl mb-4">Rent Payment</h2>

                <button onClick={handlePayment} className="btn w-full" disabled={loading}>
                    {loading ? "Preparing payment..." : "Pay ₹5000"}
                </button>

            </div>

        </div>
    )
}