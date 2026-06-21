import { randomInt } from "node:crypto";

import { REGISTER_NICKNAME_ADJECTIVES } from "@apps/backend/modules/auth/constants/register-nickname-adjectives.constants";
import { REGISTER_NICKNAME_NOUNS } from "@apps/backend/modules/auth/constants/register-nickname-nouns.constants";

/**
 * OAuth 회원가입 시 초기 닉네임: `{형용사}_{명사}_{4자리 난수}`
 */
export function buildInitialNickname(): string {
  const adjective = REGISTER_NICKNAME_ADJECTIVES[randomInt(REGISTER_NICKNAME_ADJECTIVES.length)];
  const noun = REGISTER_NICKNAME_NOUNS[randomInt(REGISTER_NICKNAME_NOUNS.length)];
  const suffix = String(randomInt(1000, 10000));
  return `${adjective}_${noun}_${suffix}`;
}
