"use client"
import axios from "axios"

export default function Upload() {

    const handleFile = async (e: any) => {
        const file = e.target.files[0]

        const form = new FormData()
        form.append("file", file)

        await axios.post("http://localhost:8000/upload", form)

        alert("Uploaded")
    }

    return <input type="file" onChange={handleFile} />
}