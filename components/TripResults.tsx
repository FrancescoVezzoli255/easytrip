"use client";

interface ItineraryCardProps {
  title?: string;
}

export function ItineraryCard({ title }: ItineraryCardProps) {
  return (
    <div className="p-4 border rounded-lg">
      {title || "ItineraryCard placeholder"}
    </div>
  );
}
