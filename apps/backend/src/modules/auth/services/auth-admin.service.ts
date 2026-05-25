import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";
import * as speakeasy from "speakeasy";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { JwtUtil } from "@apps/backend/modules/auth/utils/jwt.util";
import { AdminConfigService } from "@apps/backend/modules/admin-management/services/admin-config.service";
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
  AdminRegisterResponseDto,
  AdminTotpEnableRequestDto,
  AdminTotpVerifyLoginRequestDto,
} from "@apps/backend/modules/auth/dto/auth-admin.dto";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";

/**
 * 관리자 인증 서비스 (회원가입·로그인·TOTP)
 */
@Injectable()
export class AuthAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtUtil: JwtUtil,
    private readonly adminConfigService: AdminConfigService,
  ) {}

  /**
   * 관리자 회원가입
   */
  async register(dto: AdminRegisterRequestDto): Promise<AdminRegisterResponseDto> {
    const exists = await this.prisma.admin.findUnique({ where: { username: dto.username } });
    if (exists) {
      throw new ConflictException(AUTH_ERROR_MESSAGES.USERNAME_ALREADY_EXISTS);
    }

    const requireApproval = await this.adminConfigService.getRequireApproval();
    const approvalStatus = requireApproval ? ("PENDING" as const) : ("APPROVED" as const);
    const approvedAt = requireApproval ? null : new Date();

    const passwordHash = await bcrypt.hash(dto.password, ADMIN_BCRYPT_SALT_ROUNDS);
    const admin = await this.prisma.admin.create({
      data: { username: dto.username, passwordHash, approvalStatus, approvedAt },
      select: { id: true, username: true, approvalStatus: true, createdAt: true },
    });

    return {
      id: admin.id,
      username: admin.username,
      approvalStatus: admin.approvalStatus,
      requiresApproval: requireApproval,
      createdAt: admin.createdAt,
    };
  }

  /**
   * 관리자 로그인 1단계 (비밀번호 검증 후 TOTP 설정/검증 대기 토큰 발급)
   */
  async login(dto: AdminLoginRequestDto) {
    const admin = await this.prisma.admin.findUnique({ where: { username: dto.username } });
    if (!admin || !admin.isActive) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ADMIN_LOGIN_INVALID_CREDENTIALS);
    }

    const passwordMatch = await bcrypt.compare(dto.password, admin.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ADMIN_LOGIN_INVALID_CREDENTIALS);
    }

    if (admin.approvalStatus === "PENDING") {
      throw new ForbiddenException(AUTH_ERROR_MESSAGES.ADMIN_REGISTRATION_PENDING);
    }
    if (admin.approvalStatus === "REJECTED") {
      throw new ForbiddenException(AUTH_ERROR_MESSAGES.ADMIN_REGISTRATION_REJECTED);
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

  /**
   * 관리자 로그인 2단계 (TOTP 검증 후 액세스·리프레시 토큰 발급)
   */
  async verifyTotpLogin(dto: AdminTotpVerifyLoginRequestDto) {
    let payload: { sub: string; type?: string; aud: string };
    try {
      payload = await this.jwtUtil.verifyToken(dto.totpPendingToken);
    } catch {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ADMIN_TOTP_PENDING_TOKEN_INVALID);
    }

    if (payload.type !== TOKEN_TYPES.TOTP_PENDING || payload.aud !== AUDIENCE.ADMIN) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ADMIN_TOTP_PENDING_TOKEN_INVALID);
    }

    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        isActive: true,
        approvalStatus: true,
        isTotpEnabled: true,
        totpSecret: true,
      },
    });

    if (!admin || !admin.isActive || !admin.isTotpEnabled || !admin.totpSecret) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ADMIN_ACCOUNT_INVALID_STATE);
    }

    if (admin.approvalStatus !== "APPROVED") {
      throw new ForbiddenException(AUTH_ERROR_MESSAGES.ADMIN_NOT_APPROVED);
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

  /**
   * Google OTP 설정 시작 (secret·otpauth URL 발급)
   */
  async setupTotp(adminId: string) {
    const admin = await this.prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ADMIN_ACCOUNT_NOT_FOUND);
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

  /**
   * Google OTP 활성화
   */
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

  /**
   * 액세스 토큰 유효 확인 (`GET /auth/me`)
   */
  getSessionAvailability(user: JwtVerifiedPayload): { available: true } {
    void user.sub;
    return { available: true as const };
  }
}
