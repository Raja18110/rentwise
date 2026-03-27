"use client"

import { motion } from "framer-motion"

export default function Navbar() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-4 flex justify-between items-center"
        >

            <h1 className="font-semibold text-lg tracking-wide">
                Dashboard
            </h1>

            <button
                className="btn"
                onClick={() => {
                    localStorage.clear()
                    window.location.href = "/login"
                }}
            >
                Logout
            </button>

        </motion.div>
    )
}