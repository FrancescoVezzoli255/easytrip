"use client";

import Link from "next/link";
import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Sidebar from "./Sidebar";
import { useAppSettings } from "@/context/AppSettingsContext";

interface NavbarProps {
  sidebarOpen?: boolean;
  onSidebarOpen?: () => void;
  logo?: string;
  className?: string; // <-- aggiunto per poter passare classi
}

export default function Navbar({
  sidebarOpen = false,
  onSidebarOpen,
  logo,
  className = "",
}: NavbarProps) {
  const [internalSidebar, setInternalSidebar] = useState(false);
  const { t } = useAppSettings();

  // Determina se la sidebar è controllata dall'esterno o dallo stato interno
  const sidebarState = onSidebarOpen ? sidebarOpen : internalSidebar;

  // Funzione toggle
  const toggleSidebar = onSidebarOpen
    ? onSidebarOpen
    : () => setInternalSidebar((prev) => !prev);

  // Chiusura sidebar interna
  const closeSidebar = () => setInternalSidebar(false);

  return (
    <header
      className={`fixed top-0 left-0 h-16 flex items-center px-8 shadow-md transition-all duration-300 z-50 ${className}`}
      style={{
        backgroundColor: "var(--color-header)",
        color: "white",
        width: sidebarState ? "calc(100% - 20rem)" : "100%",
        right: sidebarState ? "20rem" : "0",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 select-none">
        {logo && (
          <img
            src={logo}
            alt={t("logoAlt")}
            className="h-16 w-auto object-contain"
          />
        )}
        <Link href="/" className="font-bold text-xl hover:opacity-90 transition">
          EasyTrip
        </Link>
      </div>

      {/* Navigazione centrata */}
      <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center space-x-10 text-sm font-medium">
        <Link href="/" className="hover:text-white/70 transition">
          {t("home")}
        </Link>
        <Link href="/favorites" className="hover:text-white/70 transition">
          {t("savedItineraries")}
        </Link>
      </nav>

      {/* Pulsante sidebar */}
      <button
        onClick={toggleSidebar}
        className="text-white text-2xl p-2 rounded hover:bg-white/10 transition md:block ml-auto"
        aria-label={sidebarState ? t("closeMenu") : t("openMenu")}
      >
        {sidebarState ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar interna se non controllata esternamente */}
      {!onSidebarOpen && (
        <Sidebar isOpen={internalSidebar} onClose={closeSidebar} />
      )}
    </header>
  );
}
