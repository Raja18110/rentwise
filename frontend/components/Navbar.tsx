"use client"

export default function Navbar() {
    return (
        <div className="bg-white shadow p-4 flex justify-between">

            <h1 className="font-bold">Dashboard</h1>

            <button
                onClick={() => {
                    localStorage.removeItem("token")
                    window.location.href = "/login"
                }}
            >
                Logout
            </button>

        </div>
    )
}