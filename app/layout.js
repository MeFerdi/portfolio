import './globals.css'
import PWARegister from '../components/portfolio/PWARegister';

export const metadata = {
  title: 'Ferdynand Odhiambo',
  description: 'My Professional Portfolio application showcasing my work as a developer',
  manifest: '/manifest.webmanifest',
  themeColor: '#1d4ed8',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ferdynand',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans bg-background text-foreground">
        <PWARegister />
        {children}
      </body>
    </html>
  )
}
