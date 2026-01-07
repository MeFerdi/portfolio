import './globals.css'
import { ThemeProvider } from '../contexts/ThemeContext'
import Script from 'next/script'

export const metadata = {
  title: 'Ferdynand Odhiambo',
  description: 'My Professional Portfolio application showcasing my work as a developer',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans bg-background text-foreground">
        {/* Set initial theme before hydration to avoid flashes and ensure dark mode works */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              var saved = localStorage.getItem('theme');
              var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              var theme = saved || (systemDark ? 'dark' : 'light');
              var root = document.documentElement;
              if (theme === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
            } catch (e) {}
          `}
        </Script>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
