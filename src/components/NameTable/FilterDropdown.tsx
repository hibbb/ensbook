// src/components/NameTable/FilterDropdown.tsx
import { useState, useRef, useEffect, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

interface FilterDropdownProps {
  isActive: boolean;
  children: ReactNode;
  menuWidth?: string;
}

export const FilterDropdown = ({
  isActive,
  children,
  menuWidth = "w-48",
}: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setIsOpen(false);
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
          isActive || isOpen
            ? "bg-blue-600 text-white shadow-sm ring-4 ring-blue-50"
            : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        }`}
      >
        <FontAwesomeIcon icon={faFilter} size="xs" />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full mt-2 bg-white/95 backdrop-blur-xl border border-gray-200/50 rounded-xl shadow-2xl py-2 z-30 animate-in fade-in zoom-in duration-150 ${menuWidth}`}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};
