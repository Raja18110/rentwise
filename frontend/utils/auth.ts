import { jwtDecode } from "jwt-decode"

type UserToken = {
    id: number
    email: string
    username?: string
    role: string
}

export function getUser(): UserToken | null {
    if (typeof window === "undefined") {
        return null
    }

    const token = localStorage.getItem("token")
    if (!token || token === "undefined" || token === "null") {
        return null
    }

    try {
        const user = jwtDecode<UserToken>(token)
        if (!user.username) {
            const username = localStorage.getItem("username")
            if (username) {
                return {
                    ...user,
                    username,
                }
            }
        }
        return user
    } catch {
        localStorage.removeItem("token")
        return null
    }
}