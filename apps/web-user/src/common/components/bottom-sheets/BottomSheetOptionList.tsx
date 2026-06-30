"use client";

import Image from "next/image";

export interface BottomSheetOption {
  icon: { type: "image"; src: string; alt: string } | { type: "element"; element: React.ReactNode };
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface BottomSheetOptionListProps {
  items: BottomSheetOption[];
}

export function BottomSheetOptionList({ items }: BottomSheetOptionListProps) {
  return (
    <div className="flex flex-col px-5 py-3 gap-2 mb-12">
      {/* 연결 안 된(disabled) 항목은 노출하지 않음 */}
      {items
        .filter((item) => !item.disabled)
        .map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            className="flex items-center gap-4 w-full py-3 transition-colors"
          >
            {item.icon.type === "image" ? (
              <Image
                src={item.icon.src}
                alt={item.icon.alt}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              item.icon.element
            )}
            <span className="text-sm text-gray-900">{item.label}</span>
          </button>
        ))}
    </div>
  );
}
