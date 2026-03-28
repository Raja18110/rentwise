"use client"

import axios from "axios"

export default function Requests() {

    const handleUpload = async (e: any) => {
        const file = e.target.files[0]

        const formData = new FormData()
        formData.append("file", file)

        try {
            await axios.post("process.env.NEXT_PUBLIC_API_URL/upload", formData)
            alert("Request submitted")
        } catch (err) {
            alert("Upload failed")
        }
    }

    return (
        <div className="p-6">

            <div className="glass p-6">

                <h2 className="text-xl mb-4">Maintenance Request</h2>

                <input className="input mb-3" placeholder="Title" />
                <textarea className="input mb-3" placeholder="Description" />

                <button className="btn w-full">Submit</button>

            </div>

        </div>
    )
}