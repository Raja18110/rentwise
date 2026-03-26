"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "../../components/Navbar"
import Sidebar from "../../components/Sidebar"

export default function DashboardLayout({ children }: any) {
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem("token")

        if (!token) {
            router.push("/login")
        }
    }, [])

    return (
        <div className="flex">

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1">
                <Navbar />
                <div className="p-6">{children}</div>
            </div>

        </div>
    )
}