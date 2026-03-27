import "./globals.css"
import { GoogleOAuthProvider } from "@react-oauth/google"

export default function RootLayout({ children }: any) {
  return (
    <html>
      <body>
        <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}