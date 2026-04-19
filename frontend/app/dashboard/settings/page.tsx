"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { getUser } from "@/utils/auth"

export default function Settings() {
    const [selectedAction, setSelectedAction] = useState("")
    const [otp, setOtp] = useState("")
    const [newValue, setNewValue] = useState("")
    const [oldPassword, setOldPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [otpVerified, setOtpVerified] = useState(false)
    const [currentEmail, setCurrentEmail] = useState("")
    const [currentUsername, setCurrentUsername] = useState("")

    const user = getUser()
    const userId = user?.id

    useEffect(() => {
        if (user) {
            setCurrentEmail(user.email ?? "")
            setCurrentUsername(user.username ?? "")
        }
    }, [user])

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    const sendOtp = async () => {
        if (!currentEmail) {
            alert("Unable to send OTP without an email")
            return
        }

        await axios.post(`${apiUrl}/auth/send-otp`, { email: currentEmail })
        alert("OTP sent to your registered email")
    }

    const verifyOtp = async () => {
        if (!otp.trim()) {
            alert("Please enter the OTP")
            return
        }

        const verify = await axios.post(`${apiUrl}/auth/verify-otp`, { email: currentEmail, otp })
        if (verify.data.message) {
            setOtpVerified(true)
            alert("OTP verified. You can now update your details.")
        } else {
            alert("Invalid OTP")
        }
    }

    const handleUpdate = async () => {
        if (!userId) {
            alert("Unable to find current user")
            return
        }

        if (!otpVerified) {
            alert("Please verify OTP before updating")
            return
        }

        if (selectedAction === "password") {
            if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
                alert("Please enter all required password fields")
                return
            }
            if (newPassword !== confirmPassword) {
                alert("New password and confirm password do not match")
                return
            }

            await axios.put(`${apiUrl}/user/update-password`, {
                user_id: userId,
                password: newPassword,
            })
            alert("Password updated successfully")
            setOldPassword("")
            setNewPassword("")
            setConfirmPassword("")
            setOtpVerified(false)
            setOtp("")
            return
        }

        if (!newValue.trim()) {
            alert("Please enter the new value")
            return
        }

        if (selectedAction === "email") {
            await axios.put(`${apiUrl}/user/update-email`, {
                user_id: userId,
                new_email: newValue,
            })
            setCurrentEmail(newValue)
        }

        if (selectedAction === "username") {
            await axios.put(`${apiUrl}/user/update-username`, {
                user_id: userId,
                username: newValue,
            })
            setCurrentUsername(newValue)
        }

        alert("Updated successfully")
        setNewValue("")
        setOtpVerified(false)
        setOtp("")
    }

    const requestBrowserNotification = async () => {
        if (typeof window === "undefined" || !("Notification" in window)) {
            alert("Browser notifications are not supported in this environment")
            return
        }

        const permission = await Notification.requestPermission()
        if (permission === "granted") {
            new Notification("RentWise notifications enabled", {
                body: "You will now receive important rent and maintenance updates.",
            })
        } else {
            alert("Notification permission not granted")
        }
    }

    return (
        <div className="page-shell flex items-center justify-center">

            <div className="page-card w-full max-w-3xl p-8">

                <div className="mb-8">
                    <p className="text-sm uppercase tracking-[0.35em] text-sky-300">Account settings</p>
                    <h2 className="text-4xl font-bold mt-3">Settings</h2>
                    <p className="text-slate-300 mt-2">Update your profile and enable notifications securely.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                        <h3 className="text-xl font-semibold mb-4 text-white">Current details</h3>
                        <div className="space-y-3 text-slate-200">
                            <div>
                                <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Email</div>
                                <div className="mt-1 text-lg">{currentEmail || "Not available"}</div>
                            </div>
                            <div>
                                <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Username</div>
                                <div className="mt-1 text-lg">{currentUsername || "Not available"}</div>
                            </div>
                            <div className="mt-6">
                                <button onClick={requestBrowserNotification} className="btn w-full py-3">
                                    Enable Notifications
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                        <h3 className="text-xl font-semibold mb-4 text-white">Edit profile</h3>
                        <div className="space-y-4">
                            <button className="btn w-full py-3" onClick={sendOtp}>
                                Send OTP to {currentEmail || "registered email"}
                            </button>

                            <div className="grid gap-3">
                                <label className="field-group">
                                    <span className="text-sm text-slate-200">Enter OTP</span>
                                    <input
                                        className="input"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </label>
                                <button className="btn w-full py-3" onClick={verifyOtp}>
                                    Verify OTP
                                </button>
                            </div>

                            <label className="field-group">
                                <span className="text-sm text-slate-200">Action</span>
                                <select
                                    value={selectedAction}
                                    onChange={(e) => {
                                        setSelectedAction(e.target.value)
                                        setOtpVerified(false)
                                        setNewValue("")
                                        setOldPassword("")
                                        setNewPassword("")
                                        setConfirmPassword("")
                                    }}
                                    className="input"
                                >
                                    <option value="">Select action</option>
                                    <option value="email">Change Email</option>
                                    <option value="username">Change Username</option>
                                    <option value="password">Change Password</option>
                                </select>
                            </label>

                            {selectedAction === "email" && (
                                <div className="space-y-3">
                                    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                                        <p className="text-sm text-slate-400">Old Email</p>
                                        <p className="text-lg text-white">{currentEmail || "Not available"}</p>
                                    </div>
                                    <input
                                        className="input"
                                        placeholder="New email address"
                                        value={newValue}
                                        onChange={(e) => setNewValue(e.target.value)}
                                    />
                                </div>
                            )}

                            {selectedAction === "username" && (
                                <div className="space-y-3">
                                    <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                                        <p className="text-sm text-slate-400">Old Username</p>
                                        <p className="text-lg text-white">{currentUsername || "Not available"}</p>
                                    </div>
                                    <input
                                        className="input"
                                        placeholder="New username"
                                        value={newValue}
                                        onChange={(e) => setNewValue(e.target.value)}
                                    />
                                </div>
                            )}

                            {selectedAction === "password" && (
                                <div className="space-y-3">
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="Current password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                    />
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="New password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                    <input
                                        type="password"
                                        className="input"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            )}

                            {otpVerified && (
                                <button className="btn w-full py-3" onClick={handleUpdate}>
                                    Save changes
                                </button>
                            )}

                            {!otpVerified && (
                                <p className="text-sm text-slate-400">Verify OTP before the update button appears.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>

        </div>
    )
}