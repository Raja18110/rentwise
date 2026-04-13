"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import axios from "axios"
import { getUser } from "../utils/auth"


export default function Navbar() {
    const [user, setUser] = useState<any>(null)
    const [notifications, setNotifications] = useState<any[]>([])
    const [count, setCount] = useState(0)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        const user = getUser()
        if (!user) return

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        axios
            .get(`${apiUrl}/notification/${user.email}`)
            .then(res => {
                setNotifications(res.data)

                const unread = res.data.filter(
                    (n: any) => n.status === "unread"
                )
                setCount(unread.length)
            })
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

                {/* 🔔 Notification Bell */}
                <div
                    className="relative text-xl cursor-pointer"
                    onClick={() => setOpen(!open)}
                >
                    🔔
                    {open && (
                        <div className="absolute right-0 mt-3 w-72 glass p-4 shadow-xl z-50">

                            <h3 className="mb-2 font-semibold">Notifications</h3>

                            {notifications.length === 0 ? (
                                <p className="text-sm">No notifications</p>
                            ) : (
                                notifications.map((n: any) => (

                                    <div
                                        key={n.id}
                                        className="mb-2 p-2 rounded hover:bg-white/10 flex justify-between items-center"
                                    >
                                        <span className="text-sm">{n.message}</span>

                                        {n.status === "unread" && (
                                            <button
                                                onClick={async () => {
                                                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
                                                    await axios.put(`${apiUrl}/notification/read/${n.id}`)
                                                    window.location.reload()
                                                }}
                                                className="text-xs text-blue-400 ml-2"
                                            >
                                                Read
                                            </button>
                                        )}

                                    </div>

                                ))
                            )}

                        </div>
                    )}

                    {count > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-2 py-0.5 rounded-full">
                            {count}
                        </span>
                    )}
                </div>

                {/* Logout */}
                <button
                    className="btn"
                    onClick={() => {
                        localStorage.clear()
                        window.location.href = "/dashboard"
                    }}
                >
                    Logout
                </button>

            </div>

        </motion.div>
    )
}