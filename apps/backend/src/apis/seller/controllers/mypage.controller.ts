import { Controller, Get, Patch, Post, Body, Request, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiExtraModels } from "@nestjs/swagger";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import {
  AUDIENCE,
  AUTH_ERROR_MESSAGES,
  AUTH_SUCCESS_MESSAGES,
} from "@apps/backend/modules/auth/constants/auth.constants";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import { AuthMypagePhoneService } from "@apps/backend/modules/auth/services/auth-mypage-phone.service";
import { AuthMypageProfileService } from "@apps/backend/modules/auth/services/auth-mypage-profile.service";
import { createMessageObject } from "@apps/backend/common/utils/message.util";
import {
  ChangePhoneRequestDto,
  SellerMypageProfileResponseDto,
  UpdateMypageProfileRequestDto,
} from "@apps/backend/modules/auth/dto/mypage-profile.dto";
import { AuthWithdrawService } from "@apps/backend/modules/auth/services/auth-withdraw.service";
import { WithdrawAccountRequestDto } from "@apps/backend/modules/auth/dto/auth-withdraw.dto";

/**
 * 마이페이지 컨트롤러
 * 판매자 마이페이지 관련 API 엔드포인트를 제공합니다.
 */
@ApiTags("마이페이지")
@ApiExtraModels(
  SellerMypageProfileResponseDto,
  UpdateMypageProfileRequestDto,
  ChangePhoneRequestDto,
)
@Controller(`${AUDIENCE.SELLER}/mypage`)
@Auth({ isPublic: false, audiences: ["seller"] })
export class SellerMypageController {
  constructor(
    private readonly mypageProfile: AuthMypageProfileService,
    private readonly mypagePhone: AuthMypagePhoneService,
    private readonly withdrawService: AuthWithdrawService,
  ) {}

  @Get("profile")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 내 프로필 조회",
    description: "로그인한 판매자의 프로필 정보를 조회합니다.",
  })
  @SwaggerResponse(200, { dataDto: SellerMypageProfileResponseDto })
  @SwaggerAuthResponses()
  async getMyProfile(@Request() req: { user: JwtVerifiedPayload }) {
    return await this.mypageProfile.getSellerProfile(req.user);
  }

  @Patch("profile")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 내 프로필 수정",
    description:
      "이름·닉네임·프로필 이미지 URL 중 요청 본문에 포함된 항목만 갱신합니다. `profileImageUrl`에 `null`을 보내면 프로필 이미지를 제거합니다.",
  })
  @SwaggerResponse(200, { dataDto: SellerMypageProfileResponseDto })
  @SwaggerAuthResponses()
  @SwaggerResponse(400, {
    dataExample: createMessageObject(AUTH_ERROR_MESSAGES.PROFILE_UPDATE_NO_FIELDS),
  })
  async patchMyProfile(
    @Body() body: UpdateMypageProfileRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    return await this.mypageProfile.updateSellerMypageProfile(body, req.user);
  }

  @Post("change-phone")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 휴대폰 번호 변경",
    description:
      "인증된 판매자의 휴대폰 번호를 새 번호로 변경합니다. 새 번호는 `purpose: phone_change`로 미리 인증이 완료되어야 합니다.",
  })
  @SwaggerResponse(200, { dataExample: createMessageObject(AUTH_SUCCESS_MESSAGES.PHONE_CHANGED) })
  @SwaggerAuthResponses()
  async changePhone(
    @Body() changePhoneDto: ChangePhoneRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    await this.mypagePhone.changePhone(changePhoneDto, req.user, AUDIENCE.SELLER);
    return createMessageObject(AUTH_SUCCESS_MESSAGES.PHONE_CHANGED);
  }

  @Post("withdraw")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 회원 탈퇴",
    description:
      "로그인한 판매자 계정·스토어·상품 등 연관 데이터를 삭제합니다. 탈퇴 후 동일 OAuth·휴대폰으로 신규 가입할 수 있습니다. 스토어에 진행 중인 주문(예약신청·입금대기·입금완료·예약확정·픽업대기·취소환불대기)이 있으면 탈퇴할 수 없습니다.",
  })
  @SwaggerResponse(200, {
    dataExample: createMessageObject(AUTH_SUCCESS_MESSAGES.ACCOUNT_WITHDRAWN),
  })
  @SwaggerAuthResponses()
  async withdrawAccount(
    @Body() body: WithdrawAccountRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    await this.withdrawService.withdraw(AUDIENCE.SELLER, req.user.sub, body.reason);
    return createMessageObject(AUTH_SUCCESS_MESSAGES.ACCOUNT_WITHDRAWN);
  }
}
