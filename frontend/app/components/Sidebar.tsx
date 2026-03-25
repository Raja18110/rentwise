// components/Sidebar.tsx
export default function Sidebar() {
    return (
        <div className="w-64 h-screen bg-gradient-to-b from-black to-gray-800 text-white p-6">
            <h1 className="text-2xl font-bold">RentWise</h1>

            <ul className="mt-6 space-y-4">
                <li className="hover:text-blue-400">Dashboard</li>
                <li className="hover:text-blue-400">Payments</li>
                <li className="hover:text-blue-400">Requests</li>
                <li className="hover:text-blue-400">Messages</li>
            </ul>
        </div>
    )
}