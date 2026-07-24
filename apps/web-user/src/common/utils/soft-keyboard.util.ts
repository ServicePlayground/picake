/** 임시 입력이 남아있지 않도록 정리하는 최대 대기 시간(ms) */
const PRIMED_INPUT_TIMEOUT_MS = 2000;

/** 키보드를 미리 띄우기 위해 붙여둔 임시 입력 */
let primedInput: HTMLInputElement | null = null;
let primedTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * 다음 화면의 입력에 소프트 키보드가 바로 올라오도록 준비합니다.
 *
 * iOS WKWebView는 사용자 제스처 없이 focus()를 호출하면 키보드를 띄우지 않습니다.
 * 그래서 탭 시점(= 제스처 안)에 화면 밖 임시 입력에 포커스를 줘 키보드를 먼저 올리고,
 * 이동한 화면의 입력이 그 포커스를 이어받게 합니다.
 *
 * 반드시 클릭/탭 핸들러 안에서 동기적으로 호출해야 하며,
 * 이동한 화면에서 실제 입력에 포커스를 준 뒤 {@link releaseSoftKeyboard}로 정리합니다.
 */
export function primeSoftKeyboard(): void {
  if (typeof document === "undefined") {
    return;
  }
  // 소프트 키보드가 없는 환경에서는 불필요하다
  if (!window.matchMedia?.("(pointer: coarse)").matches) {
    return;
  }

  releaseSoftKeyboard();

  const input = document.createElement("input");
  input.type = "text";
  input.tabIndex = -1;
  input.setAttribute("aria-hidden", "true");
  // 화면에 보이지 않되 포커스는 받을 수 있어야 한다. font-size는 iOS 자동 확대를 막기 위해 16px로 둔다.
  input.style.cssText =
    "position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0;font-size:16px;";
  document.body.appendChild(input);
  input.focus();

  primedInput = input;
  // 이동이 일어나지 않는 경우를 대비한 안전장치
  primedTimer = setTimeout(releaseSoftKeyboard, PRIMED_INPUT_TIMEOUT_MS);
}

/**
 * {@link primeSoftKeyboard}로 만든 임시 입력을 제거합니다.
 * 제거하면서 포커스가 풀리면 키보드가 다시 내려가므로,
 * 실제 입력에 포커스를 준 "뒤에" 호출해야 합니다.
 */
export function releaseSoftKeyboard(): void {
  clearTimeout(primedTimer);
  primedTimer = undefined;
  primedInput?.remove();
  primedInput = null;
}
