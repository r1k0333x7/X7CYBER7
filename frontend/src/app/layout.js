import './globals.css'
import { Inter, Roboto_Mono } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap' })
const robotoMono = Roboto_Mono({ subsets: ['latin'], display: 'swap' })

export const metadata = {
  title: 'X7 Cyber Security Platform - Defensive Security Audit',
  description: 'Premium defensive cybersecurity platform for audit, monitoring, and vulnerability management',
  keywords: 'cybersecurity, security audit, vulnerability management, defensive security',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes',
  themeColor: '#00D9FF',
  openGraph: {
    title: 'X7 Cyber Security Platform',
    description: 'Defensive Security Audit & Monitoring',
    type: 'website',
    locale: 'en_US',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='50' font-size='90' fill='%2300D9FF' text-anchor='middle' dominant-baseline='middle'>X</text></svg>" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
