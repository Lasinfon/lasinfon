import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  isLoading?: boolean;
}

/**
 * Premium lightweight button designed for subtle hover state changes.
 * Supports loading states with standard SVG spinners and various semantic presets.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyle = "w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-150 ease-out focus:outline-none flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-brand-primary text-white hover:bg-brand-primaryHover disabled:bg-slate-100 disabled:text-slate-400",
    secondary: "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 disabled:opacity-50",
    danger: "bg-red-50 text-brand-red border border-red-200 hover:bg-red-100 disabled:opacity-50",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
};
