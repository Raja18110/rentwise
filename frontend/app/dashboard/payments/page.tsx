"use client"

import axios from "axios"
import { useEffect, useState } from "react"
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const [loading, setLoading] = useState(false)
    const [leases, setLeases] = useState<any[]>([])
    const [selectedLeaseId, setSelectedLeaseId] = useState("")
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const currentUser = getUser()
        setUser(currentUser)
        if (!currentUser?.email || typeof window === "undefined") return

        const searchParams = new URLSearchParams(window.location.search)
        const leaseId = searchParams.get("leaseId")
        if (leaseId) setSelectedLeaseId(leaseId)

        axios.get(`${apiUrl}/lease/tenant/${encodeURIComponent(currentUser.email)}`)
            .then((res) => setLeases(res.data?.data || []))
            .catch((err) => {
                console.error(err)
                setLeases([])
            })
    }, [apiUrl])

    const selectedLease = leases.find((lease) => String(lease.id) === selectedLeaseId)

    const recordPayment = async (paymentIds: any = {}) => {
        if (!user?.email || !selectedLease) {
            alert("Select a lease before paying rent.")
            return
        }

        await axios.post(`${apiUrl}/payment`, {
            email: user.email,
            amount: Number(selectedLease.rent_amount),
            type: "rent",
            lease_id: selectedLease.id,
            tenant_id: user.id,
            landlord_id: selectedLease.landlord_id,
            landlord_email: selectedLease.landlord_email,
            razorpay_order_id: paymentIds.razorpay_order_id,
            razorpay_payment_id: paymentIds.razorpay_payment_id,
        })
    }

    const handlePayment = async () => {
        if (!selectedLease) {
            alert("Please choose one of your leases first.")
            return
        }

        setLoading(true)

        try {
            const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY || ""
            const canUseRazorpay = razorpayKey && razorpayKey !== "YOUR_RAZORPAY_KEY"

            if (!canUseRazorpay) {
                await recordPayment()
                alert("Payment recorded successfully in test mode.")
                return
            }

            await loadRazorpay()

            const orderRes = await axios.post(`${apiUrl}/payment/create-order`, {
                amount: Number(selectedLease.rent_amount),
            })
            const order = orderRes.data?.data

            if (!order?.id || !order?.amount) {
                throw new Error("Invalid order response")
            }

            const options = {
                key: razorpayKey,
                amount: order.amount,
                currency: "INR",
                name: "RentWise",
                order_id: order.id,
                handler: function (response: any) {
                    recordPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                    })
                        .then(() => alert("Payment Successful"))
                        .catch((err) => {
                            console.error(err)
                            alert("Payment completed, but failed to save transaction.")
                        })
                },
                prefill: {
                    name: user?.username || "",
                    email: user?.email,
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
            <div className="glass p-6 space-y-4">
                <h2 className="text-xl">Rent Payment</h2>

                {leases.length === 0 ? (
                    <p className="text-gray-400">No lease found for this tenant account.</p>
                ) : (
                    <select
                        className="input"
                        value={selectedLeaseId}
                        onChange={(e) => setSelectedLeaseId(e.target.value)}
                    >
                        <option value="">Select lease</option>
                        {leases.map((lease) => (
                            <option key={lease.id} value={lease.id}>
                                {lease.property_name} - Rs {lease.rent_amount}
                            </option>
                        ))}
                    </select>
                )}

                {selectedLease && (
                    <div className="text-sm text-slate-300">
                        <p>Landlord: {selectedLease.landlord_email}</p>
                        <p>Amount: Rs {selectedLease.rent_amount}/{selectedLease.frequency}</p>
                    </div>
                )}

                <button
                    onClick={handlePayment}
                    className="btn w-full"
                    disabled={loading || !selectedLease}
                >
                    {loading ? "Preparing payment..." : `Pay Rs ${selectedLease?.rent_amount || ""}`}
                </button>
            </div>
        </div>
    )
}
