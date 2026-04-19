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
    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
            <div className="glass p-8 max-w-lg w-full">
                <h1 className="text-2xl font-bold mb-4 text-center">Upload File</h1>
                <input
                    type="file"
                    className="input"
                    onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return

                        const url = await handleUpload(file)

                        console.log("Uploaded URL:", url)
                    }}
                />
            </div>
        </div>
    )
}