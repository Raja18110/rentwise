"use client"

import { useEffect, useState } from "react"

export default function Chat() {
    const [msg, setMsg] = useState("")
    const [messages, setMessages] = useState<string[]>([])
    const [ws, setWs] = useState<WebSocket | null>(null)

    useEffect(() => {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace("http", "ws")
        const socket = new WebSocket(`${apiUrl}/ws`)

        socket.onmessage = (event) => {
            setMessages(prev => [...prev, event.data])
        }

        setWs(socket)
    }, [])

    const sendMessage = () => {
        ws?.send(msg)
        setMsg("")
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
            <div className="glass p-8 max-w-3xl w-full space-y-6">
                <h1 className="text-2xl font-bold text-white">Chat</h1>

                <div className="glass p-4 h-60 overflow-y-scroll">
                    {messages.map((m, i) => (
                        <div key={i} className="mb-2 text-gray-100">{m}</div>
                    ))}
                </div>

                <input
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    className="input mb-2"
                />

                <button
                    onClick={sendMessage}
                    className="btn w-full"
                >
                    Send
                </button>
            </div>
        </div>
    )
}