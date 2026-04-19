import "./globals.css"
import { GoogleOAuthProvider } from "@react-oauth/google"

export default function RootLayout({ children }: any) {
  return (
    <html>
      <body className="min-h-screen text-white">
        <div className="relative min-h-screen overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1920')"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-slate-950/80 to-purple-950/70" />
          <div className="relative z-10">
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
              {children}
            </GoogleOAuthProvider>
          </div>
        </div>
      </body>
    </html>
  )
}