"use client";

import { useState } from "react";
import Script from "next/script";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { AppSettingsProvider, useAppSettings } from "@/context/AppSettingsContext";
import "./globals.css";

// ✅ Google Maps script lato client correttamente
function GoogleMapsScript() {
  const { language } = useAppSettings();

  return (
    <Script
      src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}&libraries=places&language=${language}`}
      strategy="afterInteractive" // viene eseguito dopo l'idratazione
      onLoad={() => console.log("Google Maps loaded")}
    />
  );
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="it">
      <body className="bg-gray-50 text-gray-800 min-h-screen flex flex-col relative">
        <AppSettingsProvider>
          {/* ✅ Google Maps multilingua lato client */}
          <GoogleMapsScript />

          <Navbar
            onSidebarOpen={() => setSidebarOpen(true)}
            sidebarOpen={sidebarOpen}
            logo="./logo.png"
            className={`${sidebarOpen ? "mr-80" : ""}`}
          />

          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main
            className={`flex-1 transition-all duration-300 ${
              sidebarOpen ? "mr-80" : ""
            } relative`}
          >
            {/* sfumatura decorativa */}
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none z-0" />
            {children}
          </main>

          <Footer
            thick
            className={`transition-all duration-300 ${
              sidebarOpen ? "mr-80" : ""
            }`}
          />
        </AppSettingsProvider>
      </body>
    </html>
  );
}
