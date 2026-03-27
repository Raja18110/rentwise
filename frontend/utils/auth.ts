import { jwtDecode } from "jwt-decode"

type UserToken = {
    id: number
    email: string
    role: string
}

export function getUser(): UserToken | null {
    const token = localStorage.getItem("token")
    if (!token) return null

    try {
        return jwtDecode<UserToken>(token)
    } catch {
        return null
    }
}