import React from "react";

export function Card({
  title,
  right,
  children,
  className = "",
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="text-sm font-semibold text-slate-800">{title}</div>
          <div>{right}</div>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
