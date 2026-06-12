import React from "react";
import { Badge } from "@/components/ui/badge";

type Status = "active" | "inactive" | "graduated" | "suspended";

interface StatusBadgeProps {
  status: Status | string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase() as Status;
  
  const variants: Record<Status, { className: string; label: string }> = {
    active: { className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900", label: "Active" },
    inactive: { className: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700", label: "Inactive" },
    graduated: { className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900", label: "Graduated" },
    suspended: { className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900", label: "Suspended" },
  };

  const config = variants[normalizedStatus as Status] || variants.inactive;

  return (
    <Badge variant="outline" className={`font-medium ${config.className}`} data-testid={`status-badge-${normalizedStatus}`}>
      {config.label}
    </Badge>
  );
}
