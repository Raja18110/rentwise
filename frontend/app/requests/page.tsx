"use client"

import axios from "axios"

export default function Requests() {

    const handleUpload = async (e: any) => {
        const file = e.target.files[0]

        const formData = new FormData()
        formData.append("file", file)

        try {
            await axios.post("http://127.0.0.1:8000/upload", formData)
            alert("Request submitted")
        } catch (err) {
            alert("Upload failed")
        }
    }

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">
                Maintenance Request
            </h1>

            <input type="file" onChange={handleUpload} />
        </div>
    )
}