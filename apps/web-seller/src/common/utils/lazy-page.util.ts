import { lazy, type ComponentType } from "react";

/** named export 페이지 컴포넌트를 React.lazy로 감쌉니다. */
export function lazyPage<
  TModule extends Record<string, ComponentType<object>>,
  TName extends keyof TModule & string,
>(factory: () => Promise<TModule>, exportName: TName) {
  return lazy(() =>
    factory().then((module) => ({
      default: module[exportName] as ComponentType<object>,
    })),
  );
}
