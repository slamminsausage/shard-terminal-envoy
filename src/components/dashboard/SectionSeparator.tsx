import React from "react";

interface SectionSeparatorProps {
  label: string;
}

export default function SectionSeparator({ label }: SectionSeparatorProps) {
  return (
    <div className="dashboard-separator mx-4">
      <div className="dashboard-separator-sweep" />
      <span className="dashboard-separator-label">{label}</span>
    </div>
  );
}
