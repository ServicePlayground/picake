import { describe, expect, it } from "vitest";

import { AUDIENCE } from "@apps/backend/modules/auth/constants/auth.constants";
import { PhoneVerificationPurpose } from "@apps/backend/modules/auth/constants/auth.constants";

import { PhoneUtil } from "./phone.util";

describe("PhoneUtil.normalizePhone", () => {
  it("하이픈·공백·괄호를 제거한다", () => {
    expect(PhoneUtil.normalizePhone("010-1234-5678")).toBe("01012345678");
    expect(PhoneUtil.normalizePhone("(010) 1234 5678")).toBe("01012345678");
  });
});

describe("PhoneUtil.generateVerificationCode", () => {
  it("6자리 숫자 문자열을 생성한다", () => {
    const code = PhoneUtil.generateVerificationCode();
    expect(code).toMatch(/^\d{6}$/);
  });
});

describe("PhoneUtil.getExpirationTime", () => {
  it("기본값 5분 뒤 시각을 반환한다", () => {
    const now = Date.now();
    const expiration = PhoneUtil.getExpirationTime();
    const diffMinutes = (expiration.getTime() - now) / (60 * 1000);
    expect(diffMinutes).toBeGreaterThan(4.9);
    expect(diffMinutes).toBeLessThanOrEqual(5.1);
  });

  it("분 단위 인자를 반영한다", () => {
    const now = Date.now();
    const expiration = PhoneUtil.getExpirationTime(10);
    const diffMinutes = (expiration.getTime() - now) / (60 * 1000);
    expect(diffMinutes).toBeGreaterThan(9.9);
    expect(diffMinutes).toBeLessThanOrEqual(10.1);
  });
});

describe("PhoneUtil.maskPhone", () => {
  it("11자리 번호는 가운데 4자리를 마스킹한다", () => {
    expect(PhoneUtil.maskPhone("010-1234-5678")).toBe("010-****-5678");
  });

  it("10자리 번호는 가운데 3자리를 마스킹한다", () => {
    expect(PhoneUtil.maskPhone("010-123-4567")).toBe("010-***-4567");
  });

  it("알 수 없는 길이는 원본을 그대로 반환한다", () => {
    expect(PhoneUtil.maskPhone("REVIEW_ACCOUNT")).toBe("REVIEW_ACCOUNT");
  });
});

describe("PhoneUtil.formatPhoneForDisplay", () => {
  it("11자리 번호를 하이픈 포함 형식으로 변환한다", () => {
    expect(PhoneUtil.formatPhoneForDisplay("01012345678")).toBe("010-1234-5678");
  });

  it("10자리 번호를 하이픈 포함 형식으로 변환한다", () => {
    expect(PhoneUtil.formatPhoneForDisplay("0101234567")).toBe("010-123-4567");
  });
});

describe("PhoneUtil.composeStoredPhoneVerificationPurpose", () => {
  it("audience와 kind를 콜론으로 조합한다", () => {
    expect(
      PhoneUtil.composeStoredPhoneVerificationPurpose(
        AUDIENCE.CONSUMER,
        PhoneVerificationPurpose.REGISTRATION,
      ),
    ).toBe("consumer:registration");
  });
});
