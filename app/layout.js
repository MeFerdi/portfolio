import { Source_Serif_4, Source_Sans_3 } from 'next/font/google'
import PWARegister from '../components/portfolio/PWARegister';
import { getProfile } from '../lib/content';

const { site } = getProfile();

export const metadata = {
  title: site.title,
  description: site.description,
  manifest: '/manifest.webmanifest',
  icons: { icon: '/icon-192.svg', apple: '/icon-192.svg' },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#131516' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ferdynand',
  },
}

// Both faces are preloaded so they arrive early; `swap` paints text in a metric-matched
// fallback first, so neither font delays the first paint.
const serif = Source_Serif_4({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-serif', display: 'swap' })
const sans = Source_Sans_3({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-sans', display: 'swap' })

// Applies the saved theme, or the system preference, before first paint so dark mode
// does not flash light. ThemeToggle uses the same rule.
const themeScript = `try{var t=localStorage.getItem('portfolio-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}`

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans bg-background text-foreground">
        <PWARegister />
        {children}
      </body>
    </html>
  )
}
