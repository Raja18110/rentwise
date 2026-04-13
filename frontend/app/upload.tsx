"use client"
import axios from "axios"

export default function Upload() {

    const handleUpload = async (file: File) => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const formData = new FormData()
        formData.append("file", file)

        const res = await axios.post(
            `${apiUrl}/upload`,
            formData
        )

        return res.data.url
    }
    return <input
        type="file"
        onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return

            const url = await handleUpload(file)

            console.log("Uploaded URL:", url)
        }}
    />
}