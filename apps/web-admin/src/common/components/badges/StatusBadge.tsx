import React from "react";
import { Badge } from "./Badge";
import { cn } from "@/apps/web-admin/common/utils/classname.util";

export type StatusBadgeVariant = "success" | "warning" | "error" | "info" | "default";

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: StatusBadgeVariant;
  className?: string;
}

const statusBadgeStyles: Record<StatusBadgeVariant, string> = {
  success: "bg-green-500 text-white border-transparent",
  warning: "bg-yellow-500 text-white border-transparent",
  error: "bg-red-500 text-white border-transparent",
  info: "bg-blue-500 text-white border-transparent",
  default: "bg-gray-500 text-white border-transparent",
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  children,
  variant = "default",
  className,
}) => {
  return (
    <Badge
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium",
        statusBadgeStyles[variant],
        className,
      )}
    >
      {children}
    </Badge>
  );
};
