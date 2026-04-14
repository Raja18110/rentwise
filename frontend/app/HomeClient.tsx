"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import { Sun, Moon, CreditCard, MessageCircle, Wrench } from "lucide-react"
import axios from "axios"

export default function Home() {
    const [dark, setDark] = useState(false)
    const [leases, setLeases] = useState([])



    return (
        <div className={dark ? "dark" : ""}>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 dark:from-black dark:to-gray-900 transition">

                {/* NAVBAR */}
                <nav className="fixed top-0 w-full flex justify-between items-center px-6 py-4 backdrop-blur-lg bg-white/70 dark:bg-black/60 shadow-sm z-50">
                    <h1 className="text-xl font-bold">RentWise</h1>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="hover:text-blue-600">Login</Link>
                        <Link href="/register" className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700">
                            Get Started
                        </Link>

                        {/* DARK MODE TOGGLE */}
                        <button onClick={() => setDark(!dark)}>
                            {dark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                </nav>

                {/* HERO */}
                <section className="flex flex-col items-center justify-center text-center pt-40 px-6">

                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-bold text-gray-900 dark:text-white mb-4"
                    >
                        Smart Property Management
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mb-6"
                    >
                        RentWise helps you manage tenants, payments, chat, and maintenance — all in one platform.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex gap-4"
                    >
                        <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition">
                            login here
                        </Link>

                        <Link href="/register" className="border px-6 py-3 rounded-xl hover:bg-blue-100 dark:hover:bg-green-800 transition">
                            Create Account
                        </Link>
                    </motion.div>

                </section>

                {/* FEATURES */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 mt-24 max-w-6xl mx-auto">

                    <Feature icon={<CreditCard />} title="Payments" desc="Secure rent payments with Razorpay integration." />
                    <Feature icon={<MessageCircle />} title="Chat" desc="Real-time messaging using WebSockets." />
                    <Feature icon={<Wrench />} title="Maintenance" desc="Upload issues and manage requests." />

                </section>

                {/* DASHBOARD PREVIEW */}
                <section className="mt-24 text-center px-6">

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="bg-white/70 dark:bg-gray-800/60 backdrop-blur-lg p-8 rounded-2xl shadow-xl max-w-4xl mx-auto"
                    >
                        <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-white">
                            Powerful Role-Based Dashboard
                        </h2>

                        <p className="text-gray-600 dark:text-gray-300">
                            Separate dashboards for tenants and landlords with real-time updates.
                        </p>
                    </motion.div>

                </section>

                {/* CTA */}
                <section className="mt-24 text-center px-6">

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="bg-blue-600 text-white p-10 rounded-2xl shadow-xl max-w-3xl mx-auto"
                    >
                        <h2 className="text-2xl font-semibold mb-2">
                            Ready to simplify property management?
                        </h2>

                        <Link href="/register" className="mt-4 inline-block bg-white text-blue-600 px-6 py-2 rounded-lg hover:scale-105 transition">
                            Get Started Now
                        </Link>
                    </motion.div>

                </section>

                {/* FOOTER */}
                <footer className="mt-20 mb-6 text-center text-gray-500 text-sm">
                    © 2026 RentWise — Built with Next.js & FastAPI
                </footer>

            </div>
        </div>
    )
}

function Feature({ icon, title, desc }: any) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white/70 dark:bg-gray-800/60 backdrop-blur-lg rounded-2xl shadow-md text-center"
        >
            <div className="flex justify-center mb-3 text-blue-600">
                {icon}
            </div>

            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{desc}</p>
        </motion.div>
    )
}