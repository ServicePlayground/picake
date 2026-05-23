import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import * as speakeasy from "speakeasy";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { JwtUtil } from "@apps/backend/modules/auth/utils/jwt.util";
import {
  ADMIN_BCRYPT_SALT_ROUNDS,
  ADMIN_TOTP_ISSUER,
  AUDIENCE,
  AUTH_ERROR_MESSAGES,
  AUTH_SUCCESS_MESSAGES,
  TOKEN_TYPES,
} from "@apps/backend/modules/auth/constants/auth.constants";
import {
  AdminLoginRequestDto,
  AdminRegisterRequestDto,
  AdminTotpEnableRequestDto,
  AdminTotpVerifyLoginRequestDto,
} from "@apps/backend/modules/auth/dto/auth-admin.dto";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";

@Injectable()
export class AuthAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtUtil: JwtUtil,
  ) {}

  async register(dto: AdminRegisterRequestDto) {
    const exists = await this.prisma.admin.findUnique({ where: { username: dto.username } });
    if (exists) {
      throw new ConflictException(AUTH_ERROR_MESSAGES.USERNAME_ALREADY_EXISTS);
    }

    const passwordHash = await bcrypt.hash(dto.password, ADMIN_BCRYPT_SALT_ROUNDS);
    const admin = await this.prisma.admin.create({
      data: { username: dto.username, passwordHash },
      select: { id: true, username: true, createdAt: true },
    });

    return { id: admin.id, username: admin.username, createdAt: admin.createdAt };
  }

  async login(dto: AdminLoginRequestDto) {
    const admin = await this.prisma.admin.findUnique({ where: { username: dto.username } });
    if (!admin || !admin.isActive) {
      throw new UnauthorizedException("아이디 또는 비밀번호가 올바르지 않습니다.");
    }

    const passwordMatch = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException("아이디 또는 비밀번호가 올바르지 않습니다.");
    }

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    if (!admin.isTotpEnabled) {
      const totpSetupPendingToken = await this.jwtUtil.generateTotpSetupPendingToken({
        sub: admin.id,
        aud: AUDIENCE.ADMIN,
      });
      return { requireTotpSetup: true as const, totpSetupPendingToken };
    }

    const totpPendingToken = await this.jwtUtil.generateTotpPendingToken({
      sub: admin.id,
      aud: AUDIENCE.ADMIN,
    });

    return { requireTotp: true, totpPendingToken };
  }

  async verifyTotpLogin(dto: AdminTotpVerifyLoginRequestDto) {
    let payload: { sub: string; type?: string; aud: string };
    try {
      payload = await this.jwtUtil.verifyToken(dto.totpPendingToken);
    } catch {
      throw new UnauthorizedException("유효하지 않은 임시 토큰입니다. 다시 로그인해주세요.");
    }

    if (payload.type !== TOKEN_TYPES.TOTP_PENDING || payload.aud !== AUDIENCE.ADMIN) {
      throw new UnauthorizedException("유효하지 않은 임시 토큰입니다. 다시 로그인해주세요.");
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
      select: { id: true, isActive: true, isTotpEnabled: true, totpSecret: true },
    });

    if (!admin || !admin.isActive || !admin.isTotpEnabled || !admin.totpSecret) {
      throw new UnauthorizedException("계정 상태가 올바르지 않습니다.");
    }

    const isValid = speakeasy.totp.verify({
      secret: admin.totpSecret,
      encoding: "base32",
      token: dto.totpCode,
      window: 1,
    });

    if (!isValid) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.OTP_CODE_INVALID);
    }

    return await this.jwtUtil.generateTokenPair({ sub: admin.id, aud: AUDIENCE.ADMIN });
  }

  async setupTotp(adminId: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
      throw new UnauthorizedException("계정을 찾을 수 없습니다.");
    }

    const secretObj = speakeasy.generateSecret({
      name: `${ADMIN_TOTP_ISSUER}:${admin.username}`,
      issuer: ADMIN_TOTP_ISSUER,
    });

    await this.prisma.admin.update({
      where: { id: adminId },
      data: { totpSecret: secretObj.base32, isTotpEnabled: false },
    });

    return {
      secret: secretObj.base32,
      otpauthUrl: secretObj.otpauth_url ?? "",
    };
  }

  async enableTotp(adminId: string, dto: AdminTotpEnableRequestDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: { totpSecret: true },
    });

    if (!admin?.totpSecret) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.TOTP_SETUP_REQUIRED);
    }

    const isValid = speakeasy.totp.verify({
      secret: admin.totpSecret,
      encoding: "base32",
      token: dto.totpCode,
      window: 1,
    });

    if (!isValid) {
      throw new BadRequestException(AUTH_ERROR_MESSAGES.OTP_CODE_INVALID);
    }

    await this.prisma.admin.update({
      where: { id: adminId },
      data: { isTotpEnabled: true },
    });

    return { message: AUTH_SUCCESS_MESSAGES.ADMIN_TOTP_ENABLED };
  }

  getSessionAvailability(user: JwtVerifiedPayload): { available: true } {
    void user.sub;
    return { available: true as const };
  }
}
