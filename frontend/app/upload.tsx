"use client"
import { useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

export default function Upload() {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [uploadedUrl, setUploadedUrl] = useState<string>("")

    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "")

    const handleUpload = async (selectedFile: File) => {
        try {
            setLoading(true)
            const formData = new FormData()
            formData.append("file", selectedFile)

            const res = await axios.post(
                `${apiUrl}/upload`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    timeout: 30000, // 30 seconds timeout
                }
            )

            if (res.data.success === false) {
                toast.error(res.data.detail || "Upload failed")
                return null
            }

            setUploadedUrl(res.data.url)
            toast.success(`File "${selectedFile.name}" uploaded successfully`)
            return res.data.url

        } catch (error: any) {
            console.error("Upload error:", error)

            // Handle different error types
            if (error.response?.status === 413) {
                toast.error("File size too large (max 10MB)")
            } else if (error.response?.status === 400) {
                toast.error(error.response.data?.detail || "Invalid file format")
            } else if (error.code === "ECONNABORTED") {
                toast.error("Upload timeout - file too large or slow connection")
            } else if (error.message === "Network Error") {
                toast.error("Cannot connect to server")
            } else {
                toast.error(
                    error.response?.data?.detail ||
                    error.message ||
                    "Upload failed. Please try again."
                )
            }
            return null
        } finally {
            setLoading(false)
            setFile(null)
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        // File size validation on client
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (selectedFile.size > maxSize) {
            toast.error("File size exceeds 10MB limit")
            return
        }

        // File type validation on client
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ]

        if (!allowedTypes.includes(selectedFile.type)) {
            toast.error(
                "File type not allowed. Allowed: JPG, PNG, GIF, PDF, DOC, DOCX, TXT"
            )
            return
        }

        setFile(selectedFile)
        await handleUpload(selectedFile)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-screen items-center justify-center px-4 py-10"
        >
            <div className="glass p-8 max-w-lg w-full">
                <h1 className="text-2xl font-bold mb-2 text-center">Upload File</h1>
                <p className="text-sm text-slate-300 text-center mb-6">
                    Supported: JPG, PNG, GIF, PDF, DOC, DOCX, TXT (Max 10MB)
                </p>

                <label className="block">
                    <div className="glass border-2 border-dashed border-blue-500/50 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-colors">
                        {loading ? (
                            <div>
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-400 border-t-blue-400 mb-4" />
                                <p className="text-sm text-slate-300">
                                    Uploading "{file?.name}"...
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-3xl mb-3">📁</p>
                                <p className="text-white font-medium mb-1">
                                    Click to select file
                                </p>
                                <p className="text-xs text-slate-400">
                                    or drag and drop
                                </p>
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={loading}
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                    />
                </label>

                {uploadedUrl && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg"
                    >
                        <p className="text-sm text-green-300 font-medium mb-2">
                            ✅ File uploaded successfully
                        </p>
                        <div className="bg-slate-900/50 p-2 rounded text-xs text-slate-300 break-all">
                            {uploadedUrl}
                        </div>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(uploadedUrl)
                                toast.success("URL copied to clipboard")
                            }}
                            className="mt-3 w-full px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 rounded text-white transition-colors"
                        >
                            Copy URL
                        </button>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}
