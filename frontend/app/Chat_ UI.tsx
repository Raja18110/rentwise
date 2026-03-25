"use client"
import { useEffect, useState } from "react"

export default function Chat() {
    const [ws, setWs] = useState<any>()
    const [msg, setMsg] = useState("")
    const [list, setList] = useState<string[]>([])

    useEffect(() => {
        const socket = new WebSocket("ws://localhost:8000/ws")
        socket.onmessage = (e) => setList(p => [...p, e.data])
        setWs(socket)
    }, [])

    return (
        <div>
            {list.map((m, i) => <div key={i}>{m}</div>)}
            <input onChange={e => setMsg(e.target.value)} />
            <button onClick={() => ws.send(msg)}>Send</button>
        </div>
    )
}