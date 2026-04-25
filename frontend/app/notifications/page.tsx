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
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    useEffect(() => {
        const currentUser = getUser()
        if (!currentUser) {
            router.push("/login")
            return
        }
        setUser(currentUser)
        fetchNotifications(currentUser.email)
    }, [router])

    const fetchNotifications = async (email: string) => {
        try {
            setLoading(true)
            setError(null)
            const res = await axios.get(`${apiUrl}/notification/${encodeURIComponent(email)}`)

            if (res.data?.data) {
                setNotifications(res.data.data)
            } else if (Array.isArray(res.data)) {
                setNotifications(res.data)
            } else {
                setNotifications([])
            }
        } catch (error: any) {
            console.error("Error fetching notifications:", error)
            setError(error?.response?.data?.detail || "Failed to fetch notifications")
            toast.error("Failed to load notifications")
            setNotifications([])
        } finally {
            setLoading(false)
        }
    }

    const markAsRead = async (notificationId: number) => {
        try {
            await axios.put(`${apiUrl}/notification/read/${notificationId}`)
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notificationId ? { ...n, status: "read" } : n
                )
            )
            toast.success("Marked as read")
        } catch (error) {
            console.error("Error marking notification as read:", error)
            toast.error("Failed to mark as read")
        }
    }

    const markAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter(
                (n) => n.status === "unread"
            )
            await Promise.all(
                unreadNotifications.map((n) =>
                    axios.put(`${apiUrl}/notification/read/${n.id}`)
                )
            )
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, status: "read" }))
            )
            toast.success("All notifications marked as read")
        } catch (error) {
            console.error("Error marking all as read:", error)
            toast.error("Failed to mark all as read")
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div>Loading notifications...</div>
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
                <div className="glass p-6 rounded-3xl">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold">🔔 Notifications</h1>
                        {notifications.length > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="btn-secondary text-sm"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-400 text-lg">No notifications yet</p>
                            <p className="text-gray-500 text-sm mt-2">You'll see notifications about payments, leases, and maintenance requests here.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notification, index) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all ${notification.status === "unread"
                                        ? "bg-blue-500/10 border-blue-500"
                                        : "bg-gray-500/10 border-gray-500"
                                        }`}
                                    onClick={() => {
                                        if (notification.status === "unread") {
                                            markAsRead(notification.id)
                                        }
                                    }}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-semibold">
                                                {notification.title || getNotificationTitle(notification.notification_type)}
                                            </p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {notification.message}
                                            </p>
                                            {notification.created_at && (
                                                <p className="text-xs text-gray-500 mt-2">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ml-2 ${notification.status === "unread"
                                            ? "bg-blue-500/30 text-blue-200"
                                            : "bg-gray-500/30 text-gray-300"
                                            }`}>
                                            {notification.status}
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

function getNotificationTitle(type?: string): string {
    const titles: Record<string, string> = {
        payment: "💳 Payment Notification",
        lease: "📋 Lease Notification",
        request: "🔧 Maintenance Request",
        message: "💬 New Message",
        system: "⚙️ System Notification",
        general: "📢 Notification",
    }
    return titles[type || "general"] || "📢 Notification"
}
initial = {{ opacity: 0 }}
animate = {{ opacity: 1 }}
className = "text-center py-12"
    >
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-400 border-t-blue-400" />
                        <p className="mt-4 text-slate-300">Loading notifications...</p>
                    </motion.div >
                ) : notifications.length === 0 ? (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-12 text-center rounded-lg"
    >
        <p className="text-xl text-slate-300">No notifications yet</p>
        <p className="text-sm text-slate-400 mt-2">
            When you get notifications, they&apos;ll appear here
        </p>
    </motion.div>
) : (
    notifications.map((notification, index) => (
        <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`glass p-4 rounded-lg flex items-start justify-between gap-4 transition-colors ${notification.status === "unread"
                ? "bg-blue-500/10 border-l-4 border-blue-500"
                : "bg-white/5"
                }`}
        >
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                    <p className="text-white font-medium">
                        {notification.message}
                    </p>
                    {notification.status === "unread" && (
                        <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
                    )}
                </div>
                {notification.created_at && (
                    <p className="text-xs text-slate-400">
                        {new Date(
                            notification.created_at
                        ).toLocaleDateString()}
                    </p>
                )}
            </div>

            <div className="flex gap-2">
                {notification.status === "unread" && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() =>
                            markAsRead(notification.id)
                        }
                        className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 rounded text-white transition-colors"
                    >
                        Mark Read
                    </motion.button>
                )}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() =>
                        deleteNotification(notification.id)
                    }
                    className="px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded transition-colors"
                >
                    Delete
                </motion.button>
            </div>
        </motion.div>
    ))
)}
            </div >
        </motion.div >
    )
}
