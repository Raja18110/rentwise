"use client"
import axios from "axios"

export default function PayButton() {

    const pay = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const { data } = await axios.post(`${apiUrl}/payment/create-order`, { amount: 5000 })

        const options = {
            key: "YOUR_KEY",
            amount: data.amount,
            currency: "INR",
            name: "RentWise",
            order_id: data.id,
            handler: function () {
                alert("Payment Success")
            }
        }

        const rzp = new (window as any).Razorpay(options)
        rzp.open()
    }

    return <button onClick={pay} className="bg-green-600 text-white px-4 py-2">Pay Rent</button>
}