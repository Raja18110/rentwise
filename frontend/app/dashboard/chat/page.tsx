"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import { getUser } from "@/utils/auth"

interface Message {
    type: string
    content: string
    user: string
    timestamp: string
}

export default function Chat() {
    const [msg, setMsg] = useState("")
    const [messages, setMessages] = useState<Message[]>([])
    const [ws, setWs] = useState<WebSocket | null>(null)
    const [connected, setConnected] = useState(false)
    const [connecting, setConnecting] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [user, setUser] = useState<any>(null)
    const [activeUsers, setActiveUsers] = useState(0)
    const [chatContext, setChatContext] = useState<any>({})

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Get current user
    useEffect(() => {
        const currentUser = getUser()
        if (!currentUser) {
            toast.error("User not authenticated")
            return
        }
        setUser(currentUser)
        const params = new URLSearchParams(window.location.search)
        setChatContext({
            leaseId: params.get("leaseId") || "global",
            landlordEmail: params.get("landlordEmail") || "",
            tenantEmail: params.get("tenantEmail") || "",
        })
    }, [])

    // Connect to WebSocket
    useEffect(() => {
        if (!user || !chatContext.leaseId) return

        const connectWebSocket = () => {
            try {
                setConnecting(true)
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
                const wsUrl = apiUrl.startsWith("https://")
                    ? apiUrl.replace("https://", "wss://")
                    : apiUrl.replace("http://", "ws://")

                const socket = new WebSocket(`${wsUrl}/wss?leaseId=${encodeURIComponent(chatContext.leaseId || "global")}`)

                socket.onopen = () => {
                    console.log("✅ WebSocket connected")
                    setConnected(true)
                    setConnecting(false)
                    toast.success("Connected to chat")

                    // Send user info
                    socket.send(
                        JSON.stringify({
                            type: "user_joined",
                            user: user.username || user.email,
                            content: `${user.username || user.email} joined the chat`,
                            leaseId: chatContext.leaseId,
                        })
                    )
                }

                socket.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data)
                        setMessages((prev) => [...prev, data])

                        // Update active users count
                        if (data.type === "user_left") {
                            setActiveUsers(data.active_connections || 0)
                        }
                    } catch (e) {
                        console.error("Error parsing message:", e)
                    }
                }

                socket.onerror = (error) => {
                    console.error("WebSocket error:", error)
                    setConnected(false)
                    setConnecting(false)
                    toast.error("Connection error")
                }

                socket.onclose = () => {
                    console.log("❌ WebSocket disconnected")
                    setConnected(false)
                    setConnecting(false)

                    // Reconnect after 3 seconds
                    if (!reconnectTimeoutRef.current) {
                        toast.error("Disconnected. Reconnecting...")
                        reconnectTimeoutRef.current = setTimeout(() => {
                            reconnectTimeoutRef.current = null
                            connectWebSocket()
                        }, 3000)
                    }
                }

                setWs(socket)
            } catch (error) {
                console.error("Error connecting to WebSocket:", error)
                setConnecting(false)
                toast.error("Failed to connect to chat")
            }
        }

        connectWebSocket()

        // Cleanup
        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
            if (ws) {
                ws.close()
            }
        }
    }, [user, chatContext.leaseId, chatContext.landlordEmail, chatContext.tenantEmail])

    const sendMessage = () => {
        if (!msg.trim()) {
            toast.error("Message cannot be empty")
            return
        }

        if (!ws || ws.readyState !== WebSocket.OPEN) {
            toast.error("Not connected to chat")
            return
        }

        try {
            ws.send(
                JSON.stringify({
                    type: "message",
                    content: msg.trim(),
                    user: user.username || user.email,
                    leaseId: chatContext.leaseId,
                    recipientEmail: chatContext.landlordEmail || chatContext.tenantEmail,
                })
            )
            setMsg("")
        } catch (error) {
            console.error("Error sending message:", error)
            toast.error("Failed to send message")
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-screen items-center justify-center px-4 py-10"
        >
            <div className="glass p-8 max-w-3xl w-full space-y-6 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            💬 Real-time Chat
                        </h1>
                        <p className="text-xs text-slate-300 mt-1">
                            {user?.username || user?.email}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className={`w-3 h-3 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"
                                }`}
                        />
                        <span className="text-sm">
                            {connecting
                                ? "Connecting..."
                                : connected
                                    ? "Connected"
                                    : "Disconnected"}
                        </span>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="glass p-4 flex-1 overflow-y-auto rounded-lg space-y-3 min-h-[400px]">
                    <AnimatePresence initial={false}>
                        {messages.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full flex items-center justify-center"
                            >
                                <div className="text-center">
                                    <p className="text-2xl mb-2">💬</p>
                                    <p className="text-slate-300">
                                        No messages yet. Start the conversation!
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            messages.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`mb-3 p-3 rounded-lg max-w-xs ${m.type === "message"
                                        ? m.user === (user?.username || user?.email)
                                            ? "ml-auto bg-blue-500/20 text-blue-200"
                                            : "bg-slate-700/50 text-gray-100"
                                        : "bg-yellow-500/20 text-yellow-200 text-xs italic"
                                        }`}
                                >
                                    {m.type !== "message" && (
                                        <p className="text-xs font-semibold mb-1">
                                            ℹ️ {m.content}
                                        </p>
                                    )}
                                    {m.type === "message" && (
                                        <>
                                            <p className="text-xs text-slate-400 mb-1">
                                                {m.user}
                                            </p>
                                            <p className="text-sm">{m.content}</p>
                                        </>
                                    )}
                                    {m.timestamp && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            {new Date(m.timestamp).toLocaleTimeString()}
                                        </p>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="flex gap-2">
                    <textarea
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                        className="input flex-1 resize-none h-12"
                        disabled={!connected}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={sendMessage}
                        disabled={!connected || msg.trim() === ""}
                        className="btn px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {connecting ? "..." : "Send"}
                    </motion.button>
                </div>

                {/* Connection Status */}
                {!connected && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-red-300 text-center p-2 bg-red-500/10 rounded"
                    >
                        ⚠️ {connecting ? "Connecting to chat..." : "Chat disconnected"}
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}
