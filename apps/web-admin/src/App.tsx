import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/apps/web-admin/common/components/layouts/AdminLayout";
import {
  ROUTES,
  AUTH_ROUTE_CONFIG,
  ADMIN_ROUTE_CONFIG,
} from "@/apps/web-admin/common/constants/paths.constant";
import { AuthInitializerProvider } from "@/apps/web-admin/features/auth/components/providers/AuthInitializer";
import { ErrorBoundaryProvider } from "./common/components/providers/ErrorBoundaryProvider";
import { QueryProvider } from "./common/components/providers/QueryProvider";
import { LoadingFallback } from "./common/components/fallbacks/LoadingFallback";
import { Alert } from "./common/components/alerts/Alert";
import BuildInfoLogger from "./common/components/debug/BuildInfoLogger";

const App: React.FC = () => {
  return (
    <ErrorBoundaryProvider>
      <QueryProvider>
        <BuildInfoLogger />
        <Router>
          <Alert />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* 인증 관련 경로 (AdminLayout 밖) */}
              {AUTH_ROUTE_CONFIG.map((route) => {
                const Element = route.element;
                return <Route key={route.path} path={route.path} element={<Element />} />;
              })}
              {/* 관리자 관련 경로 (AdminLayout 안) */}
              <Route
                path="/*"
                element={
                  <AuthInitializerProvider>
                    <AdminLayout>
                      <Routes>
                        {ADMIN_ROUTE_CONFIG.map((route) => {
                          const Element = route.element;
                          return <Route key={route.path} path={route.path} element={<Element />} />;
                        })}
                        <Route path="*" element={<Navigate to={ROUTES.ROOT} replace />} />
                      </Routes>
                    </AdminLayout>
                  </AuthInitializerProvider>
                }
              />
            </Routes>
          </Suspense>
        </Router>
      </QueryProvider>
    </ErrorBoundaryProvider>
  );
};

export default App;
