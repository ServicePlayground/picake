import { Injectable } from "@nestjs/common";
import { HomeBannerReadService } from "@apps/backend/modules/home-banner/services/home-banner-read.service";
import { HomeBannerWriteService } from "@apps/backend/modules/home-banner/services/home-banner-write.service";
import {
  CreateHomeBannerDto,
  HomeBannerItemResponseDto,
  HomeBannerListResponseDto,
  ReorderHomeBannerDto,
  UpdateHomeBannerDto,
} from "@apps/backend/modules/home-banner/dto/home-banner.dto";

/**
 * 홈 배너 서비스
 *
 * 홈 배너 관련 기능을 통합해서 제공하는 파사드 서비스입니다.
 * 실제 비즈니스 로직은 services/ 하위 서비스들에 분리되어 있습니다.
 */
@Injectable()
export class HomeBannerService {
  constructor(
    private readonly readService: HomeBannerReadService,
    private readonly writeService: HomeBannerWriteService,
  ) {}

  listForAdmin(): Promise<HomeBannerListResponseDto> {
    return this.readService.listForAdmin();
  }

  listActiveForConsumer(): Promise<HomeBannerListResponseDto> {
    return this.readService.listActiveForConsumer();
  }

  create(dto: CreateHomeBannerDto): Promise<HomeBannerItemResponseDto> {
    return this.writeService.create(dto);
  }

  update(id: string, dto: UpdateHomeBannerDto): Promise<HomeBannerItemResponseDto> {
    return this.writeService.update(id, dto);
  }

  remove(id: string): Promise<void> {
    return this.writeService.remove(id);
  }

  reorder(dto: ReorderHomeBannerDto): Promise<void> {
    return this.writeService.reorder(dto);
  }
}
