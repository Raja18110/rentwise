"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"
import { CreditCard, MessageCircle, Wrench } from "lucide-react"

export default function Home() {
    const [dark, setDark] = useState(false)

    return (
        <div className={dark ? "dark" : ""}>

            {/* 🌆 BACKGROUND IMAGE + OVERLAY */}
            <div className="min-h-screen relative">

                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1920')"
                    }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-purple-900/60 to-pink-800/60" />

                {/* CONTENT */}
                <div className="relative z-10">

                    {/* NAVBAR */}
                    <nav className="fixed top-0 w-full flex justify-between items-center px-8 py-4 backdrop-blur-xl bg-white/10 border-b border-white/20 z-50">
                        <h1 className="text-2xl font-bold text-white">
                            RentWise
                        </h1>

                        <div className="flex items-center gap-6 text-white">
                            <Link href="/login" className="hover:text-blue-300 transition">
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className="bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-2 rounded-xl shadow-lg hover:scale-105 transition"
                            >
                                Get Started
                            </Link>
                        </div>
                    </nav>

                    {/* HERO */}
                    <section className="flex flex-col items-center justify-center text-center pt-44 px-6 text-white">

                        <motion.h1
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-6xl font-extrabold mb-6"
                        >
                            Modern Property Management Platform
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg max-w-2xl mb-8 text-gray-200"
                        >
                            Manage tenants, rent payments, maintenance and communication — all in one intelligent system.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex gap-4 flex-wrap justify-center"
                        >
                            <Link
                                href="/login"
                                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-7 py-3 rounded-xl shadow-xl hover:scale-105 transition"
                            >
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className="bg-white text-black px-7 py-3 rounded-xl shadow-lg hover:scale-105 transition"
                            >
                                Create Account
                            </Link>
                        </motion.div>

                    </section>

                    {/* FEATURES */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 mt-28 max-w-6xl mx-auto">

                        <Feature
                            icon={<CreditCard />}
                            title="Smart Payments"
                            desc="Secure rent payments with Razorpay."
                            color="from-blue-500 to-indigo-600"
                        />

                        <Feature
                            icon={<MessageCircle />}
                            title="Real-Time Chat"
                            desc="Instant tenant-landlord communication."
                            color="from-purple-500 to-pink-500"
                        />

                        <Feature
                            icon={<Wrench />}
                            title="Maintenance"
                            desc="Track and resolve issues easily."
                            color="from-red-500 to-orange-500"
                        />

                    </section>

                    {/* DASHBOARD PREVIEW */}
                    <section className="mt-28 text-center px-6">

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="bg-white/10 backdrop-blur-xl p-10 rounded-3xl shadow-2xl max-w-4xl mx-auto border border-white/20 text-white"
                        >
                            <h2 className="text-3xl font-bold mb-3">
                                Role-Based Smart Dashboard
                            </h2>

                            <p className="text-gray-300">
                                Separate dashboards for tenants and landlords with real-time insights and automation.
                            </p>
                        </motion.div>

                    </section>

                    {/* FOOTER */}
                    <footer className="mt-24 mb-6 text-center text-gray-300 text-sm">
                        2026 RentWise — Built with Next.js & FastAPI
                    </footer>

                </div>
            </div>
        </div>
    )
}

function Feature({ icon, title, desc, color }: any) {
    return (
        <motion.div
            whileHover={{ scale: 1.07 }}
            className="p-6 rounded-2xl shadow-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white"
        >
            <div className={`w-12 h-12 flex items-center justify-center rounded-xl mb-4 text-white bg-gradient-to-r ${color}`}>
                {icon}
            </div>

            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-300 text-sm">{desc}</p>
        </motion.div>
    )
}