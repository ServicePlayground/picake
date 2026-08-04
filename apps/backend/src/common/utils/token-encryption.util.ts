import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH_BYTES = 12;

/**
 * DB에 평문으로 남기면 안 되는 외부 provider 토큰(예: Apple `refresh_token`) 암복호화용.
 * `APPLE_REFRESH_TOKEN_ENCRYPTION_KEY`(32byte, hex 64자)로 AES-256-GCM 암호화.
 * 저장 형식: `{ivHex}:{authTagHex}:{cipherHex}`
 */
@Injectable()
export class TokenEncryptionUtil {
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const hexKey = this.configService.get<string>("APPLE_REFRESH_TOKEN_ENCRYPTION_KEY");
    if (!hexKey || hexKey.length !== 64) {
      throw new Error(
        "APPLE_REFRESH_TOKEN_ENCRYPTION_KEY가 설정되지 않았거나 32byte(hex 64자)가 아닙니다.",
      );
    }
    this.key = Buffer.from(hexKey, "hex");
  }

  encrypt(plainText: string): string {
    const iv = randomBytes(IV_LENGTH_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
  }

  decrypt(cipherText: string): string {
    const [ivHex, authTagHex, encryptedHex] = cipherText.split(":");
    if (!ivHex || !authTagHex || !encryptedHex) {
      throw new Error("암호화된 토큰 형식이 올바르지 않습니다.");
    }
    const decipher = createDecipheriv(ALGORITHM, this.key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, "hex")),
      decipher.final(),
    ]);
    return decrypted.toString("utf8");
  }
}
