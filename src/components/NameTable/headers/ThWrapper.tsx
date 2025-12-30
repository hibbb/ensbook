import React from "react";

export const ThWrapper = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`h-full flex items-center text-sm font-qs-semibold font-normal text-text-main uppercase tracking-wider ${className}`}
  >
    {children}
  </div>
);
