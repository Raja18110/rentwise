"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import axios from "axios"
import { getUser } from "../utils/auth"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Navbar() {
    const [user, setUser] = useState<any>(null)
    const [count, setCount] = useState(0)
    const router = useRouter()

    useEffect(() => {
        const user = getUser()
        if (!user) return

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

        // Fetch unread notification count
        axios
            .get(`${apiUrl}/notification/${user.email}`)
            .then(res => {
                const unread = (res.data.data || []).filter(
                    (n: any) => n.status === "unread"
                )
                setCount(unread.length)
            })
            .catch(err => console.error("Failed to fetch notifications:", err))

        setUser(user)
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-4 flex justify-between items-center"
        >

            <h1 className="font-semibold text-lg tracking-wide">
                Dashboard
            </h1>

            <div className="flex items-center gap-4">

                {/* 🔔 Notification Bell - Link to full page */}
                <Link href="/notifications">
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="relative text-xl cursor-pointer"
                    >
                        🔔
                        {count > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-2 py-0.5 rounded-full animate-pulse">
                                {count}
                            </span>
                        )}
                    </motion.div>
                </Link>

                {/* Logout */}
                <button
                    className="btn"
                    onClick={() => {
                        localStorage.clear()
                        router.push("/login")
                    }}
                >
                    Logout
                </button>

            </div>

        </motion.div>
    )
}
