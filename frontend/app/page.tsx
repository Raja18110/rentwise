import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-black dark:to-gray-900">

      <main className="max-w-4xl text-center p-10 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">

        {/* LOGO */}
        <div className="flex justify-center mb-6">
          <Image
            src="/next.svg"
            alt="logo"
            width={80}
            height={40}
            className="dark:invert"
          />
        </div>

        {/* TITLE */}
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
          RentWise
        </h1>

        {/* TAGLINE */}
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Smart Property Management System with Payments, Chat & Maintenance
        </p>

        {/* FEATURES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <Feature title="💳 Easy Payments" desc="Pay rent securely using Razorpay" />
          <Feature title="💬 Real-time Chat" desc="Instant communication with landlord" />
          <Feature title="📸 Maintenance" desc="Upload issues with images easily" />

        </div>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">

          <Link
            href="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="border border-gray-400 px-6 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Register
          </Link>

        </div>

      </main>

      {/* FOOTER */}
      <p className="mt-6 text-sm text-gray-500">
        Built with Next.js + FastAPI + PostgreSQL
      </p>

    </div>
  )
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
    </div>
  )
}