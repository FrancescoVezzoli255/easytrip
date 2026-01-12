"use client";

import { useState, useEffect, useRef } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { it, enUS } from "date-fns/locale";
import { Calendar, X } from "lucide-react";
import { useAppSettings } from "@/context/AppSettingsContext";
import { translations, Language } from "@/lib/translations";
import { currencySymbols } from "@/lib/currency";

registerLocale("it", it);
registerLocale("en", enUS);

interface Props {
  destination?: string;
  budget?: number;
  rooms?: number;
  checkIn?: Date | null;
  checkOut?: Date | null;
  freeText?: string;
  days: number;
  loading: boolean;
  onGenerate: () => void;
}

export default function SearchContainer({
  destination: defaultDestination = "",
  budget: defaultBudget,
  rooms: defaultRooms = 1,
  checkIn: defaultCheckIn = null,
  checkOut: defaultCheckOut = null,
  freeText: defaultFreeText = "",
  days,
  loading,
  onGenerate,
}: Props) {
  const { language, currency, rates } = useAppSettings();
  const t = translations[language as Language] || translations.it;

  const [isMounted, setIsMounted] = useState(false);

  const [destination, setDestination] = useState(defaultDestination);
  const [freeText, setFreeText] = useState(defaultFreeText);

  // === GUESTS ===
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState<number>(defaultRooms ?? 1);
  const [people, setPeople] = useState(adults + children);
  const [showGuestsPopup, setShowGuestsPopup] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);

  // === DATES ===
  const [checkIn, setCheckIn] = useState<Date | null>(defaultCheckIn);
  const [checkOut, setCheckOut] = useState<Date | null>(defaultCheckOut);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    checkIn,
    checkOut,
  ]);
  const [startDate, endDate] = dateRange;

  // === UI ===
  const [hasSelectedCity, setHasSelectedCity] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState(false);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  const guidedDisabled = freeText.trim().length > 0;

  // === BUDGET (USD BASE) ===
  const [budgetUSD, setBudgetUSD] = useState<number>(defaultBudget ?? 0);
  const rate = rates[currency] ?? 1;

  // === DERIVED PEOPLE ===
  useEffect(() => {
    setPeople(adults + children);
  }, [adults, children]);

  // === MOUNT ===
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // === CLICK OUTSIDE ===
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        guestsRef.current &&
        !guestsRef.current.contains(event.target as Node)
      ) {
        setShowGuestsPopup(false);
      }
      if (
        inputRef.current &&
        dropdownRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === CACHE LOAD (ONCE) ===
  useEffect(() => {
    if (!isMounted) return;

    const saved = localStorage.getItem("searchCache");
    if (saved) {
      const data = JSON.parse(saved);

      setDestination(data.destination || "");
      setAdults(Math.max(1, data.adults ?? 2));
      setChildren(data.children ?? 0);
      setRooms(data.rooms ?? 1);
      setCheckIn(data.checkIn ? new Date(data.checkIn) : null);
      setCheckOut(data.checkOut ? new Date(data.checkOut) : null);
      setFreeText(data.freeText || "");
      setDateRange([
        data.checkIn ? new Date(data.checkIn) : null,
        data.checkOut ? new Date(data.checkOut) : null,
      ]);

      if (data.budget) {
        setBudgetUSD(Number(data.budget)); // USD puro
      }

      if (data.destination) setHasSelectedCity(true);
    }
  }, [isMounted]);

  // === CACHE SAVE ===
  useEffect(() => {
    if (!isMounted) return;

    localStorage.setItem(
      "searchCache",
      JSON.stringify({
        destination,
        adults,
        children,
        rooms,
        people,
        budget: budgetUSD === 0 ? "" : budgetUSD,
        checkIn,
        checkOut,
        freeText,
      })
    );
  }, [
    destination,
    adults,
    children,
    rooms,
    people,
    budgetUSD,
    checkIn,
    checkOut,
    freeText,
    isMounted,
  ]);

  // === GOOGLE PLACES ===
  useEffect(() => {
    if (!isMounted || !(window as any).google || !inputRef.current) return;

    const service = new (window as any).google.maps.places.AutocompleteService();

    if (destination && !hasSelectedCity) {
      service.getPlacePredictions(
        { input: destination, types: ["(cities)"] },
        (predictions: any) => {
          if (predictions) {
            setSuggestions(predictions.map((p: any) => p.description));
            setShowDropdown(true);
          } else {
            setSuggestions([]);
            setShowDropdown(false);
          }
          setHighlightedIndex(-1);
        }
      );
    } else {
      setShowDropdown(false);
    }
  }, [destination, hasSelectedCity, isMounted]);

  // === KEYBOARD NAV ===
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        setDestination(suggestions[highlightedIndex]);
        setHasSelectedCity(true);
        setShowDropdown(false);
      }
    }
  };

  // === GENERATE ===
  const handleGenerateClick = () => {
    const missing: string[] = [];
    if (!destination) missing.push(t.location);
    if (!people) missing.push(t.people);
    if (!rooms || rooms < 1) missing.push(t.rooms);
    if (!checkIn) missing.push(t.checkIn);
    if (!checkOut) missing.push(t.checkOut);

    if (missing.length > 0) {
      setMissingFields(missing);
      setShowPopup(true);
      return;
    }
    onGenerate();
  };

  const getInputClass = () =>
    "px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full font-medium shadow-sm";

  if (!isMounted) return null;

  return (
    <div className="bg-white rounded-3xl p-10 max-w-4xl w-full shadow-2xl -mt-20 mx-4 md:mx-auto relative">
      <h2 className="text-3xl font-semibold mb-6 text-center">
        {t.createTrip}
      </h2>

      {/* TEXTAREA */}
      <div className="mb-10">
        <label className="text-sm font-semibold text-gray-600 mb-1 block">
          {t.describeTrip}
        </label>
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          rows={4}
          placeholder={t.freeTextHint}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          {t.freeTextNotice}
        </p>
      </div>

      {/* GUIDED */}
      <div className={guidedDisabled ? "opacity-50 pointer-events-none" : ""}>
        {/* LOCATION + GUESTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* LOCATION */}
          <div className="relative">
            <label className="text-xs text-gray-500 mb-1 block">
              {t.location}
            </label>
            <input
              type="text"
              placeholder={t.locationPlaceholder}
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setHasSelectedCity(false);
              }}
              onKeyDown={handleKeyDown}
              className={getInputClass()}
              ref={inputRef}
              autoComplete="off"
            />

            {showDropdown && suggestions.length > 0 && (
              <ul
                ref={dropdownRef}
                className="absolute z-20 w-full bg-white border border-gray-300 rounded-xl mt-1 max-h-56 overflow-auto shadow-lg"
              >
                {suggestions.map((city, idx) => (
                  <li
                    key={idx}
                    className={`px-3 py-2 cursor-pointer transition ${
                      highlightedIndex === idx ? "bg-indigo-100" : ""
                    }`}
                    onMouseDown={() => {
                      setDestination(city);
                      setHasSelectedCity(true);
                      setShowDropdown(false);
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                  >
                    {city}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* GUESTS */}
          <div className="relative col-span-2" ref={guestsRef}>
            <label className="text-xs text-gray-500 mb-1 block">
              {t.people}
            </label>
            <input
              readOnly
              onClick={() => setShowGuestsPopup((v) => !v)}
              value={`${adults} ${t.adultsLabel} · ${children} ${t.childrenLabel} · ${rooms} ${t.roomsLabel}`}
              className={`${getInputClass()} cursor-pointer`}
            />

            {showGuestsPopup && (
              <div className="absolute z-30 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
                <GuestRow
                  label={t.adults}
                  subtitle={t.adultsAge}
                  value={adults}
                  min={1}
                  onChange={setAdults}
                />
                <GuestRow
                  label={t.children}
                  subtitle={t.childrenAge}
                  value={children}
                  min={0}
                  onChange={setChildren}
                />
                <GuestRow
                  label={t.rooms}
                  subtitle={t.roomsSubtitle}
                  value={rooms}
                  min={1}
                  onChange={setRooms}
                />
              </div>
            )}
          </div>
        </div>

        {/* DATE + BUDGET */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">
              {t.selectPeriod}
            </label>
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(u) => {
                setDateRange(u);
                setCheckIn(u[0]);
                setCheckOut(u[1]);
              }}
              locale={language === "it" ? it : enUS}
              monthsShown={2}
              minDate={new Date()}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              {t.budget} ({currencySymbols[currency]})
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder={`0 ${currencySymbols[currency]}`}
              value={
                budgetUSD === 0
                  ? ""
                  : Math.round(budgetUSD * rate).toLocaleString(language)
              }
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                setBudgetUSD(raw ? Number(raw) / rate : 0);
              }}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200"
            />
          </div>
        </div>
      </div>

      {/* BUTTON */}
      <button
        onClick={handleGenerateClick}
        disabled={loading}
        className={`mt-6 w-full py-4 rounded-2xl text-white font-semibold text-lg ${
          loading ? "bg-gray-500" : "bg-indigo-600 hover:bg-indigo-500"
        }`}
      >
        {loading ? t.generating : t.generateItinerary}
      </button>

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full relative">
            <button
              className="absolute top-4 right-4"
              onClick={() => setShowPopup(false)}
            >
              <X size={20} />
            </button>
            <ul className="space-y-2">
              {missingFields.map((f, i) => (
                <li key={i} className="text-sm">
                  • {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===========================
   GUEST ROW COMPONENT
=========================== */
function GuestRow({
  label,
  subtitle,
  value,
  min,
  onChange,
}: {
  label: string;
  subtitle: string;
  value: number;
  min: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-xs text-gray-500">{subtitle}</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={value === min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full border border-gray-300 disabled:opacity-40"
        >
          −
        </button>
        <span className="w-4 text-center">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full border border-gray-300"
        >
          +
        </button>
      </div>
    </div>
  );
}
