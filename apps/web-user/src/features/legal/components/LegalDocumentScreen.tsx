"use client";

import { useEffect, useRef, useState } from "react";
import { legalApi } from "@/apps/web-user/features/legal/apis/legal.api";

interface LegalDocumentScreenProps {
  filename: string;
}

const LEGAL_CONTENT_CLASS = "legal-document-content";

export function LegalDocumentScreen({ filename }: LegalDocumentScreenProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    legalApi.getDocument(filename).then(setHtmlContent);
  }, [filename]);

  useEffect(() => {
    if (!htmlContent) return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    const id = requestAnimationFrame(() => {
      contentRef.current?.querySelector(`#${CSS.escape(hash)}`)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => cancelAnimationFrame(id);
  }, [htmlContent]);

  return (
    <div className="pb-[calc(60px+env(safe-area-inset-bottom,0px))]">
      <style>{`
        .${LEGAL_CONTENT_CLASS} {
          padding: 16px 20px 32px;
          font-size: 14px;
          line-height: 1.8;
          color: #333;
        }
        .${LEGAL_CONTENT_CLASS} h1 {
          display: none;
        }
        .${LEGAL_CONTENT_CLASS} h2 {
          font-size: 14px;
          font-weight: 700;
          color: #111;
          margin: 28px 0 10px;
          padding-bottom: 8px;
          border-bottom: 1px solid #ebebea;
          scroll-margin-top: 60px;
        }
        .${LEGAL_CONTENT_CLASS} p {
          margin-bottom: 8px;
        }
        .${LEGAL_CONTENT_CLASS} ol,
        .${LEGAL_CONTENT_CLASS} ul {
          padding-left: 18px;
          margin-bottom: 8px;
        }
        .${LEGAL_CONTENT_CLASS} li {
          margin-bottom: 5px;
        }
        .${LEGAL_CONTENT_CLASS} li > ol,
        .${LEGAL_CONTENT_CLASS} li > ul {
          margin-top: 5px;
        }
        .${LEGAL_CONTENT_CLASS} strong {
          color: #111;
          font-weight: 600;
        }
        .${LEGAL_CONTENT_CLASS} blockquote {
          margin: 10px 0 16px;
          padding: 14px 16px;
          border-left: 3px solid #ebebea;
          background: #f9f9f8;
          color: #555;
        }
        .${LEGAL_CONTENT_CLASS} table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0 16px;
          font-size: 13px;
        }
        .${LEGAL_CONTENT_CLASS} th {
          background: #f7f7f6;
          border: 1px solid #e0e0e0;
          padding: 8px 10px;
          text-align: left;
          font-weight: 600;
          color: #333;
        }
        .${LEGAL_CONTENT_CLASS} td {
          border: 1px solid #e0e0e0;
          padding: 8px 10px;
          vertical-align: top;
          color: #444;
        }
      `}</style>
      {htmlContent ? (
        <div
          ref={contentRef}
          className={LEGAL_CONTENT_CLASS}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      ) : null}
    </div>
  );
}
