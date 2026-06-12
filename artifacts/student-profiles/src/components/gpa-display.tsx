import React from "react";

interface GpaDisplayProps {
  gpa: number | null | undefined;
  className?: string;
}

export function GpaDisplay({ gpa, className = "" }: GpaDisplayProps) {
  if (gpa === null || gpa === undefined) {
    return <span className={`text-muted-foreground ${className}`}>N/A</span>;
  }

  const numericGpa = Number(gpa);
  let colorClass = "text-red-600 dark:text-red-400"; // < 2.5
  
  if (numericGpa >= 3.5) {
    colorClass = "text-emerald-600 dark:text-emerald-400";
  } else if (numericGpa >= 2.5) {
    colorClass = "text-amber-600 dark:text-amber-400";
  }

  return (
    <span className={`font-mono font-medium ${colorClass} ${className}`} data-testid="gpa-display">
      {numericGpa.toFixed(2)}
    </span>
  );
}
