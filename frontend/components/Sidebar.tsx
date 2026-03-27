"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function Sidebar() {
    return (
        <div className="w-64 min-h-screen p-6 glass flex flex-col justify-between">

            {/* Logo */}
            <h2 className="text-2xl font-bold mb-8 tracking-wide">
                RentWise
            </h2>

            {/* Menu */}
            <ul className="space-y-4">

                {[
                    { name: "Dashboard", path: "/dashboard" },
                    { name: "Lease", path: "/dashboard/lease" },
                    { name: "Chat", path: "/chat" },
                    { name: "Payments", path: "/payments" },
                    { name: "Requests", path: "/requests" },
                    { name: "Settings", path: "/dashboard/settings" }
                ].map((item, i) => (

                    <motion.li
                        key={i}
                        whileHover={{ scale: 1.05, x: 5 }}
                        className="p-2 rounded-lg hover:bg-white/10 transition"
                    >
                        <Link href={item.path}>
                            {item.name}
                        </Link>
                    </motion.li>

                ))}

            </ul>

            {/* Footer */}
            <p className="text-sm text-gray-400 mt-10">
                © RentWise
            </p>

        </div>
    )
}