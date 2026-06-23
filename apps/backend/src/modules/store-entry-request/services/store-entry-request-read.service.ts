import { Injectable } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { StoreEntryRequestExistsResponseDto } from "@apps/backend/modules/store-entry-request/dto/store-entry-request.dto";

/**
 * 입점 요청 조회 서비스
 */
@Injectable()
export class StoreEntryRequestReadService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 현재 사용자가 해당 장소에 이미 입점 요청했는지 여부 (버튼 상태 표시용)
   * @param consumerId 구매자 ID
   * @param kakaoPlaceId 카카오 로컬 장소 ID
   */
  async existsForUser(
    consumerId: string,
    kakaoPlaceId: string,
  ): Promise<StoreEntryRequestExistsResponseDto> {
    const existing = await this.prisma.storeEntryRequest.findUnique({
      where: { consumerId_kakaoPlaceId: { consumerId, kakaoPlaceId } },
      select: { id: true },
    });

    return { requested: existing !== null };
  }
}
