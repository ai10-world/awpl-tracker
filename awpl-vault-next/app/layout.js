import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400','600','700','800'],
  variable: '--font-syne',
})
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300','400','500','600'],
  variable: '--font-body',
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400','500','600'],
  variable: '--font-mono',
})

export const metadata = {
  title: 'AWPL Vault — Distributor ID Manager',
  description: 'Secure local vault for managing AWPL distributor IDs',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body bg-bg min-h-screen relative z-[1]">
        {children}
      </body>
    </html>
  )
}
