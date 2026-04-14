import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Trimly — Book your barber before leaving home',
  description: 'Find and book the best barbers and salons near you. No waiting, no walk-ins.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Polyfill localStorage.getItem for sandboxed preview environments where
            the Storage mock may be missing individual methods */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (typeof window !== 'undefined' && window.localStorage &&
                typeof window.localStorage.getItem !== 'function') {
              window.localStorage.getItem = function() { return null; };
              window.localStorage.setItem = window.localStorage.setItem || function() {};
              window.localStorage.removeItem = window.localStorage.removeItem || function() {};
            }
          } catch(e) {}
        `}} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
