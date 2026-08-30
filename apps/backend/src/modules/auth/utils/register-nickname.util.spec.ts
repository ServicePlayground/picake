import { describe, expect, it } from "vitest";

import { REGISTER_NICKNAME_ADJECTIVES } from "@apps/backend/modules/auth/constants/register-nickname-adjectives.constants";
import { REGISTER_NICKNAME_NOUNS } from "@apps/backend/modules/auth/constants/register-nickname-nouns.constants";

import { buildInitialNickname } from "./register-nickname.util";

describe("buildInitialNickname", () => {
  it("`{형용사}_{명사}_{4자리 난수}` 형식을 따른다", () => {
    const nickname = buildInitialNickname();
    const [adjective, noun, suffix] = nickname.split("_");

    expect(REGISTER_NICKNAME_ADJECTIVES).toContain(adjective);
    expect(REGISTER_NICKNAME_NOUNS).toContain(noun);
    expect(suffix).toMatch(/^\d{4}$/);
  });

  it("호출할 때마다 값이 달라질 수 있다 (100회 중 최소 2개 이상의 고유값)", () => {
    const nicknames = new Set(Array.from({ length: 100 }, () => buildInitialNickname()));
    expect(nicknames.size).toBeGreaterThan(1);
  });
});
