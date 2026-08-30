import { describe, expect, it } from "vitest";

import { maskDisplayNameForPrivacy } from "./display-name.util";

describe("maskDisplayNameForPrivacy", () => {
  it("빈 값·공백만 있는 값은 빈 문자열을 반환한다", () => {
    expect(maskDisplayNameForPrivacy(null)).toBe("");
    expect(maskDisplayNameForPrivacy(undefined)).toBe("");
    expect(maskDisplayNameForPrivacy("   ")).toBe("");
  });

  it("한 글자는 *로만 마스킹한다", () => {
    expect(maskDisplayNameForPrivacy("이")).toBe("*");
  });

  it("두 글자는 첫 글자만 남기고 마스킹한다", () => {
    expect(maskDisplayNameForPrivacy("이수")).toBe("이*");
  });

  it("세 글자는 첫·끝 글자만 남긴다", () => {
    expect(maskDisplayNameForPrivacy("이수은")).toBe("이*은");
  });

  it("네 글자 이상은 첫·끝만 남기고 가운데를 모두 마스킹한다", () => {
    expect(maskDisplayNameForPrivacy("김철수영")).toBe("김**영");
  });

  it("앞뒤 공백은 트리밍 후 마스킹한다", () => {
    expect(maskDisplayNameForPrivacy("  이수은  ")).toBe("이*은");
  });
});
