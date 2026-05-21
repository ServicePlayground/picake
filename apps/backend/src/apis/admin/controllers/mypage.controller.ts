import { Controller, Post, Body, Request, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Auth } from "@apps/backend/modules/auth/decorators/auth.decorator";
import { SwaggerResponse } from "@apps/backend/common/decorators/swagger-response.decorator";
import { SwaggerAuthResponses } from "@apps/backend/common/decorators/swagger-auth-responses.decorator";
import {
  AUDIENCE,
  AUTH_SUCCESS_MESSAGES,
} from "@apps/backend/modules/auth/constants/auth.constants";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import { AuthWithdrawService } from "@apps/backend/modules/auth/services/auth-withdraw.service";
import { WithdrawAccountRequestDto } from "@apps/backend/modules/auth/dto/auth-withdraw.dto";
import { createMessageObject } from "@apps/backend/common/utils/message.util";

/**
 * 관리자 마이페이지 컨트롤러
 */
@ApiTags("[관리자] 마이페이지")
@Controller(`${AUDIENCE.ADMIN}/mypage`)
@Auth({ isPublic: false, audiences: [AUDIENCE.ADMIN] })
export class AdminMypageController {
  constructor(private readonly withdrawService: AuthWithdrawService) {}

  @Post("withdraw")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "(로그인 필요) 회원 탈퇴",
    description:
      "로그인한 관리자 계정과 관련 데이터를 삭제합니다. 탈퇴 후 동일 아이디로 신규 가입할 수 있습니다.",
  })
  @SwaggerResponse(200, {
    dataExample: createMessageObject(AUTH_SUCCESS_MESSAGES.ACCOUNT_WITHDRAWN),
  })
  @SwaggerAuthResponses()
  async withdrawAccount(
    @Body() body: WithdrawAccountRequestDto,
    @Request() req: { user: JwtVerifiedPayload },
  ) {
    await this.withdrawService.withdraw(AUDIENCE.ADMIN, req.user.sub, body.reason);
    return createMessageObject(AUTH_SUCCESS_MESSAGES.ACCOUNT_WITHDRAWN);
  }
}
