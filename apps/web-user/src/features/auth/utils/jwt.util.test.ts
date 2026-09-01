import { describe, expect, it } from "vitest";

import { decodeJwtPayload } from "./jwt.util";

function buildToken(payload: object): string {
  const json = JSON.stringify(payload);
  const base64 = Buffer.from(json, "utf-8").toString("base64");
  const base64url = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `header.${base64url}.signature`;
}

describe("decodeJwtPayload", () => {
  it("payload를 서명 검증 없이 디코딩한다", () => {
    const token = buildToken({ sub: "consumer-1", aud: "consumer" });
    expect(decodeJwtPayload(token)).toEqual({ sub: "consumer-1", aud: "consumer" });
  });

  it("payload에 한글 등 비ASCII 문자가 있어도 깨지지 않는다", () => {
    const token = buildToken({ sub: "consumer-1", name: "홍길동" });
    expect(decodeJwtPayload(token)).toEqual({ sub: "consumer-1", name: "홍길동" });
  });

  it("점(.)으로 구분된 세그먼트가 없으면 null을 반환한다", () => {
    expect(decodeJwtPayload("not-a-jwt")).toBeNull();
  });

  it("payload 세그먼트가 올바른 JSON이 아니면 null을 반환한다", () => {
    const invalidPayload = Buffer.from("이건 JSON이 아님", "utf-8").toString("base64");
    expect(decodeJwtPayload(`header.${invalidPayload}.signature`)).toBeNull();
  });

  it("빈 문자열이면 null을 반환한다", () => {
    expect(decodeJwtPayload("")).toBeNull();
  });
});
