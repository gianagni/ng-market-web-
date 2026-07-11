import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";
import SplashScreen from '../components/SplashScreen';
import { CartProvider } from '../lib/CartContext';
import CartDrawer from '../components/CartDrawer';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const spaceMono = Space_Mono({ 
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: "NG Market | Akun Digital, Jasa & Server",
  description: "Beli akun premium streaming, domain, VPS, dan jasa kreatif dengan harga terjangkau. Garansi penuh, proses cepat, dan layanan terpercaya.",
  metadataBase: new URL("https://market.gianagni.my.id"),
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "NG Market | Akun Digital, Jasa & Server",
    description: "Beli akun premium streaming, domain, VPS, dan jasa kreatif dengan harga terjangkau. Garansi penuh, proses cepat, dan layanan terpercaya.",
    url: "https://market.gianagni.my.id",
    siteName: "NG Market",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NG Market",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NG Market | Akun Digital, Jasa & Server",
    description: "Beli akun premium streaming, domain, VPS, dan jasa kreatif dengan harga terjangkau. Garansi penuh, proses cepat, dan layanan terpercaya.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" sizes="any" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${spaceGrotesk.variable} ${spaceMono.variable} font-sans bg-white text-black antialiased`}>
        <div className="fixed inset-0 pointer-events-none" 
             style={{
               backgroundImage: 'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)',
               backgroundSize: '40px 40px',
               zIndex: -1
             }}>
        </div>
        <CartProvider>
          <SplashScreen />
          <Navbar />
          <CartDrawer />
          <main className="pt-[80px]">
            {children}
          </main>
          <Toaster position="top-right" />
        </CartProvider>
      </body>
    </html>
  );
}