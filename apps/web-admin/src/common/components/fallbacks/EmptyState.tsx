import React from "react";
import { cn } from "@/apps/web-admin/common/utils/classname.util";

interface EmptyStateProps {
  message?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message = "데이터가 없습니다.",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center py-12 text-sm text-muted-foreground",
        className,
      )}
    >
      <p>{message}</p>
    </div>
  );
};
