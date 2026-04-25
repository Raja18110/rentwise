"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Navbar from "../../components/Navbar"
import Sidebar from "../../components/Sidebar"
import { getUser } from "../../utils/auth"

export default function DashboardLayout({ children }: any) {
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const token = localStorage.getItem("token")
        const user = getUser()

        if (!token || !user) {
            router.push("/login")
            return
        }

        // Role-based access control
        const isLandlord = user.role === "landlord"
        const isTenant = user.role === "tenant"

        // Landlord-only pages
        const landlordOnlyPaths = ["/dashboard/property"]

        // Tenant-only pages
        const tenantOnlyPaths = ["/dashboard/payments", "/dashboard/requests"]

        // Check if current path requires specific role
        if (landlordOnlyPaths.some(path => pathname.startsWith(path)) && !isLandlord) {
            router.push("/dashboard")
            return
        }

        if (tenantOnlyPaths.some(path => pathname.startsWith(path)) && !isTenant) {
            router.push("/dashboard")
            return
        }

    }, [pathname])

    return (
        <div className="flex">

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1">
                <Navbar />
                <div className="p-6">{children}</div>
            </div>

        </div>
    )
}
