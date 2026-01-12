"use client";

import Link from "next/link";
import { useAppSettings } from "@/context/AppSettingsContext";
import { useEffect, useState } from "react";

interface FooterProps { 
  thick?: boolean; 
  className?: string 
}

export default function Footer({ thick = false, className = "" }: FooterProps) {
  const { t } = useAppSettings();
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className={`bg-[var(--color-footer)] text-white py-6 ${className}`}>
      <div className="w-full px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="font-semibold text-lg">EasyTrip</h4>
          <p className="text-sm mt-2 max-w-sm">{t("footerDescription")}</p>
        </div>

        <div>
          <h5 className="font-semibold">{t("about")}</h5>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/about">{t("about")}</Link></li>
            <li><Link href="/careers">{t("careers")}</Link></li>
            <li><Link href="/contact">{t("contact")}</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold">{t("legal")}</h5>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/privacy">{t("privacy")}</Link></li>
            <li><Link href="/terms">{t("terms")}</Link></li>
            <li><Link href="/cookies">{t("cookies")}</Link></li>
          </ul>
        </div>
      </div>

      <div className="w-full border-t border-white/10 mt-8 pt-6 text-sm text-gray-300 text-center">
        © {year ?? ""} EasyTrip. {t("allRightsReserved")}
      </div>
    </footer>
  );
}
