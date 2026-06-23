import { Injectable, ConflictException } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { CreateStoreEntryRequestDto } from "@apps/backend/modules/store-entry-request/dto/store-entry-request.dto";
import { STORE_ENTRY_REQUEST_ERROR_MESSAGES } from "@apps/backend/modules/store-entry-request/constants/store-entry-request.constants";

/**
 * 입점 요청 생성 서비스
 * 미입점(카카오 장소) 스토어에 대한 입점 요청을 저장합니다.
 */
@Injectable()
export class StoreEntryRequestWriteService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 입점 요청 추가 (사용자용)
   * 동일 사용자가 같은 장소를 중복 요청하는 것은 DB unique 제약으로 방지합니다.
   * @param consumerId 구매자 ID
   * @param dto 카카오 장소 정보
   */
  async createForUser(consumerId: string, dto: CreateStoreEntryRequestDto) {
    try {
      await this.prisma.storeEntryRequest.create({
        data: {
          consumerId,
          kakaoPlaceId: dto.kakaoPlaceId,
          placeName: dto.placeName,
          address: dto.address,
          roadAddress: dto.roadAddress,
          phone: dto.phone,
          categoryName: dto.categoryName,
          placeUrl: dto.placeUrl,
          latitude: dto.latitude,
          longitude: dto.longitude,
        },
      });
    } catch (error: any) {
      if (error?.code === "P2002") {
        LoggerUtil.log(
          `입점 요청 실패: 이미 요청 존재 - consumerId: ${consumerId}, kakaoPlaceId: ${dto.kakaoPlaceId}`,
        );
        throw new ConflictException(STORE_ENTRY_REQUEST_ERROR_MESSAGES.ALREADY_EXISTS);
      }
      LoggerUtil.log(
        `입점 요청 실패: 알 수 없는 에러 - consumerId: ${consumerId}, kakaoPlaceId: ${dto.kakaoPlaceId}, error: ${error?.message || String(error)}`,
      );
      throw error;
    }
  }
}
