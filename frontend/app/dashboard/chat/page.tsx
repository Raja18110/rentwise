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
        <div className="p-6">

            <h1 className="text-xl font-bold mb-4">Chat</h1>

            <div className="border h-60 overflow-y-scroll p-2 mb-2">
                {messages.map((m, i) => (
                    <div key={i}>{m}</div>
                ))}
            </div>

            <input
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                className="border p-2 w-full mb-2"
            />

            <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-4 py-2"
            >
                Send
            </button>
        </div>
    )
}