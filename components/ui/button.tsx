import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
}

export function Button({
  className,
  variant = "default",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
    outline:
      "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 focus-visible:ring-gray-300",
    ghost: "bg-transparent text-gray-800 hover:bg-gray-100",
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props} />
  );
}
