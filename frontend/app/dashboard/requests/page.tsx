"use client"

import { useState } from "react"
import axios from "axios"

export default function Requests() {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [file, setFile] = useState<File | null>(null)

    const handleUpload = async () => {
        if (!file) {
            alert("Please choose a file before submitting.")
            return
        }

        const formData = new FormData()
        formData.append("file", file)
        formData.append("title", title)
        formData.append("description", description)

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
            await axios.post(`${apiUrl}/upload`, formData)
            alert("Request submitted")
            setTitle("")
            setDescription("")
            setFile(null)
        } catch (err) {
            console.error(err)
            alert("Upload failed")
        }
    }

    return (
        <div className="p-6">

            <div className="glass p-6">

                <h2 className="text-xl mb-4">Maintenance Request</h2>

                <input
                    className="input mb-3"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    className="input mb-3"
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <input
                    type="file"
                    className="mb-3"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />

                <button onClick={handleUpload} className="btn w-full">Submit</button>

            </div>

        </div>
    )
}