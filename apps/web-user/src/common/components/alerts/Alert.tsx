"use client";

import { useAlertStore } from "@/apps/web-user/common/store/alert.store";

export function Alert() {
  const { alert, hideAlert } = useAlertStore();

  const handleClose = () => {
    const { onClose } = alert;
    // 애니메이션 완료 후 닫고, 후속 동작(로그인 시트 열기 등) 실행
    setTimeout(() => {
      hideAlert();
      onClose?.();
    }, 300);
  };

  if (!alert.isOpen) return null;

  const keyframes = `
    @keyframes alertBackdropIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes alertSlideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  const getTitleColor = () => {
    switch (alert.type) {
      case "error":
        return "#dc2626";
      case "success":
        return "#16a34a";
      case "warning":
        return "#d97706";
      case "info":
        return "#2563eb";
      default:
        return "#6b7280";
    }
  };

  const getButtonColor = () => {
    switch (alert.type) {
      case "error":
        return "#6b7280";
      case "success":
        return "#16a34a";
      case "warning":
        return "#d97706";
      case "info":
        return "#2563eb";
      default:
        return "#6b7280";
    }
  };

  return (
    <>
      <style>{keyframes}</style>
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
          animation: "alertBackdropIn 0.3s ease",
        }}
        onClick={handleClose}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "32px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            maxWidth: "400px",
            width: "90%",
            textAlign: "center",
            animation: "alertSlideUp 0.3s ease-out",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "12px",
              color: getTitleColor(),
            }}
          >
            {alert.title}
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              marginBottom: "24px",
              lineHeight: "1.5",
            }}
          >
            {alert.message}
          </p>
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "center",
            }}
          >
            <button
              onClick={handleClose}
              style={{
                backgroundColor: getButtonColor(),
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              확인
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
