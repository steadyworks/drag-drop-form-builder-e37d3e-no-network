import './globals.css'

export const metadata = {
  title: 'Drag & Drop Form Builder',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
