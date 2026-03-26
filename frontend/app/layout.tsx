import "./globals.css"

export default function RootLayout({ children }: any) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}