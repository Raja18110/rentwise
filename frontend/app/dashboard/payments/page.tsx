"use client"

import axios from "axios"

export default function Payments() {

    const handlePayment = async () => {
        try {
            const { data } = await axios.post(
                "http://127.0.0.1:8000/payment/create-order",
                { amount: 5000 }
            )

            const options = {
                key: "YOUR_RAZORPAY_KEY",
                amount: data.amount,
                currency: "INR",
                name: "RentWise",
                order_id: data.id,
                handler: function () {
                    alert("Payment Successful")
                }
            }

            const rzp = new (window as any).Razorpay(options)
            rzp.open()

        } catch (err) {
            console.error(err)
            alert("Payment failed")
        }
    }

    return (
        <div className="p-6">

            <div className="glass p-6">

                <h2 className="text-xl mb-4">Rent Payment</h2>

                <button className="btn w-full">
                    Pay ₹5000
                </button>

            </div>

        </div>
    )
}