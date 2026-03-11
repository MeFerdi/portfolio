import './globals.css'

export const metadata = {
  title: 'Ferdynand Odhiambo',
  description: 'My Professional Portfolio application showcasing my work as a developer',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}
