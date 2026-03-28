"use client"
import axios from "axios"

export default function Upload() {

    const handleUpload = async (file: File) => {
        const formData = new FormData()
        formData.append("file", file)

        const res = await axios.post(
            "http://127.0.0.1:8000/upload",
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