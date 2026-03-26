import Sidebar from "../components/Sidebar"
import { GoogleOAuthProvider } from "@react-oauth/google"
import Navbar from "../components/Navbar"
import "./globals.css"

export default function RootLayout({ children }: any) {
  return (
    <html>
      <body>
        <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
          <Navbar />
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-gray-100 min-h-screen">
        {children}
      </div>
    </div>
  )
}