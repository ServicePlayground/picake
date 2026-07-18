import { Injectable } from "@nestjs/common";
import { UpdateMemberActiveDto } from "@apps/backend/modules/member-management/dto/member-management-common.dto";
import {
  MemberConsumerItemResponseDto,
  MemberConsumerListQueryDto,
  MemberConsumerListResponseDto,
} from "@apps/backend/modules/member-management/dto/member-management-consumer.dto";
import {
  MemberSellerItemResponseDto,
  MemberSellerListQueryDto,
  MemberSellerListResponseDto,
} from "@apps/backend/modules/member-management/dto/member-management-seller.dto";
import { MemberConsumerService } from "@apps/backend/modules/member-management/services/member-consumer.service";
import { MemberSellerService } from "@apps/backend/modules/member-management/services/member-seller.service";

/**
 * 회원(구매자·판매자) 관리 서비스
 *
 * 구매자·판매자 목록 조회와 계정 상태 변경 API를 통합 제공합니다.
 * (admin-management의 facade 패턴과 동일)
 */
@Injectable()
export class MemberManagementService {
  constructor(
    private readonly memberConsumerService: MemberConsumerService,
    private readonly memberSellerService: MemberSellerService,
  ) {}

  async listConsumers(query: MemberConsumerListQueryDto): Promise<MemberConsumerListResponseDto> {
    return await this.memberConsumerService.list(query);
  }

  async updateConsumerActive(
    consumerId: string,
    dto: UpdateMemberActiveDto,
  ): Promise<MemberConsumerItemResponseDto> {
    return await this.memberConsumerService.updateActive(consumerId, dto);
  }

  async listSellers(query: MemberSellerListQueryDto): Promise<MemberSellerListResponseDto> {
    return await this.memberSellerService.list(query);
  }

  async updateSellerActive(
    sellerId: string,
    dto: UpdateMemberActiveDto,
  ): Promise<MemberSellerItemResponseDto> {
    return await this.memberSellerService.updateActive(sellerId, dto);
  }
}
