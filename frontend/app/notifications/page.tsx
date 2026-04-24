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
    status: "read" | "unread"
    created_at?: string
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
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
            const res = await axios.get(`${apiUrl}/notification/${email}`)
            setNotifications(res.data || [])
        } catch (error) {
            console.error("Error fetching notifications:", error)
            toast.error("Failed to fetch notifications")
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

    const deleteNotification = async (notificationId: number) => {
        try {
            setNotifications((prev) =>
                prev.filter((n) => n.id !== notificationId)
            )
            toast.success("Notification deleted")
        } catch (error) {
            console.error("Error deleting notification:", error)
            toast.error("Failed to delete notification")
        }
    }

    const unreadCount = notifications.filter(
        (n) => n.status === "unread"
    ).length

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
        >
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Notifications</h1>
                <p className="text-slate-300">
                    {unreadCount > 0 ? (
                        <>
                            You have <span className="text-blue-400 font-semibold">{unreadCount}</span> unread
                            notification{unreadCount > 1 ? "s" : ""}
                        </>
                    ) : (
                        "All caught up!"
                    )}
                </p>
            </div>

            {/* Mark All as Read Button */}
            {unreadCount > 0 && (
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={markAllAsRead}
                    className="mb-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors"
                >
                    Mark All as Read
                </motion.button>
            )}

            {/* Notifications List */}
            <div className="space-y-4">
                {loading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-400 border-t-blue-400" />
                        <p className="mt-4 text-slate-300">Loading notifications...</p>
                    </motion.div>
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
            </div>
        </motion.div>
    )
}
