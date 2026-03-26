export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex">
            {/* Sidebar (optional) */}
            <div className="w-64 bg-black text-white p-4">
                Dashboard Menu
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 bg-gray-100 min-h-screen">
                {children}
            </div>
        </div>
    )
}