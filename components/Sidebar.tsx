"use client";

import { FaUser, FaSignOutAlt, FaChevronLeft } from "react-icons/fa";
import { useAppSettings } from "@/context/AppSettingsContext";
import { translations, Language } from "@/lib/translations";
import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { language, setLanguage, currency, setCurrency } = useAppSettings();
  const t = translations[language as Language] || translations.it;

  return (
    <div className={`fixed inset-0 z-50 flex ${isOpen ? "" : "pointer-events-none"}`}>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-80 bg-white p-6 shadow-lg transform transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <FaUser className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t.welcomeBack}</p>
              <p className="font-semibold text-gray-800">{t.guest}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <FaChevronLeft />
          </button>
        </div>

        {/* Contenuti */}
        <div className="space-y-4">
          <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-50">
            {t.loginRegister}
          </button>

          {/* Lingua */}
          <div className="pt-3 border-t">
            <p className="text-sm font-medium text-gray-700 mb-2">{t.language}</p>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="it">Italiano</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          {/* Valuta */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">{t.currency}</p>
            <select
              value={currency}
              onChange={(e) =>
                setCurrency(e.target.value as "EUR" | "USD" | "GBP")
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div className="pt-6 border-t">
            <Link href="/profile" className="block px-3 py-2 rounded hover:bg-gray-50">
              {t.profile}
            </Link>
            <Link href="/saved" className="block px-3 py-2 rounded hover:bg-gray-50">
              {t.saved}
            </Link>
            <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 text-red-600 mt-4 flex items-center gap-2">
              <FaSignOutAlt /> {t.logout}
            </button>
          </div>
        </div>

        <div className="mt-auto text-xs text-gray-400 pt-6 border-t">
          <p>{t.needHelp} support@easytrip.example</p>
        </div>
      </aside>
    </div>
  );
}
