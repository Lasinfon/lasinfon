import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Presentational Card container embodying the Virgil Pana design aesthetic.
 * Pristine white background, clean borders, and soft shadows with micro-transitions.
 */
export const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-6 shadow-sm transition-all duration-150 ease-out ${
        onClick ? "cursor-pointer hover:shadow-md hover:border-slate-300" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};
