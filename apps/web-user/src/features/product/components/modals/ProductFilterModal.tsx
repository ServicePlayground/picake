"use client";

import { useState, useEffect } from "react";
interface ProductFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: ProductFilters) => void;
  initialFilters?: ProductFilters;
}

export interface ProductFilters {
  minPrice?: number;
  maxPrice?: number;
}

export function ProductFilterModal({
  isOpen,
  onClose,
  onApply,
  initialFilters = {},
}: ProductFilterModalProps) {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [minPriceInput, setMinPriceInput] = useState<string>(
    initialFilters.minPrice?.toString() || "",
  );
  const [maxPriceInput, setMaxPriceInput] = useState<string>(
    initialFilters.maxPrice?.toString() || "",
  );

  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
      setMinPriceInput(initialFilters.minPrice?.toString() || "");
      setMaxPriceInput(initialFilters.maxPrice?.toString() || "");
    }
  }, [isOpen, initialFilters]);

  const handleApply = () => {
    const finalFilters: ProductFilters = {
      ...filters,
      minPrice: minPriceInput ? Number(minPriceInput) : undefined,
      maxPrice: maxPriceInput ? Number(maxPriceInput) : undefined,
    };
    onApply(finalFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: ProductFilters = {};
    setFilters(resetFilters);
    setMinPriceInput("");
    setMaxPriceInput("");
    onApply(resetFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        opacity: 1,
        transition: "opacity 0.3s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "32px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#111827",
            marginBottom: "24px",
          }}
        >
          필터
        </h2>

        {/* 가격 범위 */}
        <div style={{ marginBottom: "32px" }}>
          <h3
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "12px",
            }}
          >
            가격 범위
          </h3>
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              inputMode="numeric"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="최소 가격"
              style={{
                flex: 1,
                minWidth: "120px",
                height: "40px",
                padding: "0 12px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#007bff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
              }}
            />
            <span style={{ color: "#6b7280", fontSize: "14px" }}>~</span>
            <input
              type="text"
              inputMode="numeric"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value.replace(/[^\d]/g, ""))}
              placeholder="최대 가격"
              style={{
                flex: 1,
                minWidth: "120px",
                height: "40px",
                padding: "0 12px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#007bff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
              }}
            />
          </div>
        </div>

        {/* 버튼 */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
            marginTop: "32px",
          }}
        >
          <button
            onClick={handleReset}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              border: "1px solid #e5e7eb",
              backgroundColor: "#ffffff",
              color: "#374151",
              transition: "all 0.2s ease",
            }}
          >
            초기화
          </button>
          <button
            onClick={handleApply}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
              backgroundColor: "#000000",
              color: "#ffffff",
              transition: "background-color 0.2s ease",
            }}
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
}
