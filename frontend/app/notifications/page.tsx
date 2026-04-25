"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import axios from "axios"
import { getUser } from "@/utils/auth"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

interface Notification {
    id: number
    message: string
    title?: string
    status: "read" | "unread"
    created_at?: string
    notification_type?: string
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    useEffect(() => {
        const currentUser = getUser()

        if (!currentUser) {
            router.push("/login")
            return
        }

        fetchNotifications(currentUser.email)
    }, [])

    const fetchNotifications = async (email: string) => {
        try {
            setLoading(true)
            const res = await axios.get(`${apiUrl}/notification/${encodeURIComponent(email)}`)

            if (res.data?.data) {
                setNotifications(res.data.data)
            } else if (Array.isArray(res.data)) {
                setNotifications(res.data)
            } else {
                setNotifications([])
            }
        } catch (err: any) {
            console.error(err)
            setError("Failed to fetch notifications")
            toast.error("Failed to load notifications")
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (id: number) => {
        try {
            await axios.put(`${apiUrl}/notification/read/${id}`)

            setNotifications(prev =>
                prev.map(n =>
                    n.id === id ? { ...n, status: "read" } : n
                )
            )

            toast.success("Marked as read")
        } catch (err) {
            console.error(err)
            toast.error("Failed to mark as read")
        }
    }

    const markAllAsRead = async () => {
        try {
            const unread = notifications.filter(n => n.status === "unread")

            await Promise.all(
                unread.map(n =>
                    axios.put(`${apiUrl}/notification/read/${n.id}`)
                )
            )

            setNotifications(prev =>
                prev.map(n => ({ ...n, status: "read" }))
            )

            toast.success("All marked as read")
        } catch (err) {
            console.error(err)
            toast.error("Failed to mark all as read")
        }
    }

    // 🔄 LOADING UI
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                >
                    <div className="h-8 w-8 animate-spin border-4 border-white border-t-blue-500 rounded-full mx-auto" />
                    <p className="mt-4 text-gray-300">Loading notifications...</p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
            >

                <div className="glass p-6 rounded-2xl">

                    {/* HEADER */}
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">🔔 Notifications</h1>

                        {notifications.length > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="btn text-sm"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="bg-red-500/20 p-3 rounded mb-4 text-red-300">
                            {error}
                        </div>
                    )}

                    {/* EMPTY STATE */}
                    {notifications.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            No notifications yet
                        </div>
                    ) : (

                        <div className="space-y-3">

                            {notifications.map((n, index) => (

                                <motion.div
                                    key={n.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => {
                                        if (n.status === "unread") {
                                            markAsRead(n.id)
                                        }
                                    }}
                                    className={`p-4 rounded-lg cursor-pointer transition ${n.status === "unread"
                                            ? "bg-blue-500/10 border-l-4 border-blue-500"
                                            : "bg-white/5"
                                        }`}
                                >

                                    <div className="flex justify-between">

                                        <div>
                                            <p className="font-semibold">
                                                {n.title || getNotificationTitle(n.notification_type)}
                                            </p>

                                            <p className="text-sm text-gray-400 mt-1">
                                                {n.message}
                                            </p>

                                            {n.created_at && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {new Date(n.created_at).toLocaleString()}
                                                </p>
                                            )}
                                        </div>

                                        <span className="text-xs px-2 py-1 bg-white/10 rounded">
                                            {n.status}
                                        </span>

                                    </div>

                                </motion.div>

                            ))}

                        </div>
                    )}

                </div>

            </motion.div>

        </div>
    )
}

// 🔤 TITLE HELPER
function getNotificationTitle(type?: string): string {
    const titles: Record<string, string> = {
        payment: "💳 Payment",
        lease: "📄 Lease",
        request: "🔧 Request",
        message: "💬 Message",
        system: "⚙️ System",
        general: "📢 Notification",
    }

    return titles[type || "general"]
}