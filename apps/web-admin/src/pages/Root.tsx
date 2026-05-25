import React from "react";
import { LIST_SCREEN_HEADING, LIST_SECTION_GAP } from "@/apps/web-admin/common/constants/list-typography.constant";

export const RootPage: React.FC = () => {
  return (
    <div className={LIST_SECTION_GAP}>
      <h1 className={LIST_SCREEN_HEADING}>홈</h1>
      <p className="text-sm text-muted-foreground">관리자 기능이 순차적으로 추가될 예정입니다.</p>
    </div>
  );
};
