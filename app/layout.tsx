import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/lib/context/CartContext'
import { AuthProvider } from '@/lib/context/AuthContext'
import { CompanyProvider } from '@/lib/context/CompanyContext'
import { LanguageProvider } from '@/lib/context/LanguageContext'
import { ThemeClient } from '@/components/theme-client'
import './globals.css'
import { ChatBotFloat } from '@/components/chatbot-float'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'TechStore - Premium Tech Products',
  description: 'Shop premium tech products with fast shipping and excellent customer service',
  icons: {
    icon: '/Icono.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <LanguageProvider>
          <ThemeClient>
            <CompanyProvider>
              
              {/*  El Carrito va afuera */}
              <CartProvider>
    
                {/*  El Auth va adentro */}
                <AuthProvider>
                  {children}

                  <ChatBotFloat />
                </AuthProvider>
                
              </CartProvider>
              
            </CompanyProvider>
          </ThemeClient>
        </LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
