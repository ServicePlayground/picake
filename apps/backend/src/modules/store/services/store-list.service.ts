import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, Store } from "@apps/backend/infra/database/prisma/generated/client";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import {
  STORE_ERROR_MESSAGES,
  StoreSortBy,
  StoreMapPickupPeriodKind,
} from "@apps/backend/modules/store/constants/store.constants";
import {
  EnableStatus,
  ProductCategoryType,
} from "@apps/backend/modules/product/constants/product.constants";
import { StoreMapperUtil } from "@apps/backend/modules/store/utils/store-mapper.util";
import { StoreResponseDto } from "@apps/backend/modules/store/dto/store-detail.dto";
import {
  GetStoresRequestDto,
  GetSellerStoresRequestDto,
} from "@apps/backend/modules/store/dto/store-list.dto";
import {
  parseRegionsParam,
  buildStoreWhereInputForRegions,
  buildStoreWhereForRegionKeywords,
} from "@apps/backend/modules/store/utils/region-filter.util";
import { STORE_REGION_DEPTHS } from "@apps/backend/modules/store/constants/store.constants";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import { calculatePaginationMeta } from "@apps/backend/common/utils/pagination.util";
import { LikeStoreDetailService } from "@apps/backend/modules/like/services/like-store-detail.service";
import { StoreOwnershipUtil } from "@apps/backend/modules/store/utils/store-ownership.util";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import { PRODUCT_ERROR_MESSAGES } from "@apps/backend/modules/product/constants/product.constants";
import { storeRowMatchesMapPickupFilter } from "@apps/backend/modules/store/utils/store-business-calendar.util";
import { buildStoreKeywordSearchWhere } from "@apps/backend/modules/product/utils/product-search.util";

/**
 * 스토어 목록 조회 서비스
 * 스토어 목록/상세 조회 관련 로직을 담당합니다.
 */
@Injectable()
export class StoreListService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly likeStoreDetailService: LikeStoreDetailService,
  ) {}

  /**
   * 스토어 목록 조회 (사용자용)
   * 검색(스토어명), 정렬, 페이지네이션을 지원합니다. 로그인 시 각 스토어의 좋아요 여부(isLiked)를 반환합니다.
   */
  async getStoresForUser(query: GetStoresRequestDto, user?: JwtVerifiedPayload) {
    const {
      search,
      page,
      limit,
      sortBy,
      regions,
      sizes,
      minPrice,
      maxPrice,
      productCategoryTypes,
      latitude,
      longitude,
      pickupFilterDate,
      pickupFilterPeriod,
    } = query;

    const hasPickupDate = Boolean(pickupFilterDate?.trim());
    const hasPickupPeriod = pickupFilterPeriod != null;
    if (hasPickupDate !== hasPickupPeriod) {
      throw new BadRequestException(STORE_ERROR_MESSAGES.PICKUP_FILTER_DATE_PERIOD_PAIR);
    }

    const baseWhere = await this.buildStoreWhereForUser({
      search,
      regions,
      sizes,
      minPrice,
      maxPrice,
      productCategoryTypes,
    });
    const { where, totalItems: pickupTotalItems } = await this.narrowStoreWhereByMapPickupFilter(
      baseWhere,
      pickupFilterDate?.trim(),
      pickupFilterPeriod,
    );
    const sort = sortBy ?? StoreSortBy.LATEST;

    if (sort === StoreSortBy.DISTANCE) {
      if (latitude === undefined || longitude === undefined) {
        throw new BadRequestException(PRODUCT_ERROR_MESSAGES.DISTANCE_SORT_REQUIRES_COORDINATES);
      }
    }

    const totalItems =
      pickupTotalItems !== null ? pickupTotalItems : await this.prisma.store.count({ where });

    let stores: Store[];

    if (sort === StoreSortBy.RATING_AVG || sort === StoreSortBy.DISTANCE) {
      const allMatching = await this.prisma.store.findMany({ where, select: { id: true } });
      const idList = allMatching.map((s) => s.id);
      if (idList.length === 0) {
        stores = [];
      } else if (sort === StoreSortBy.RATING_AVG) {
        const orderedIds = await this.getStoreIdsOrderedByRating(idList, page, limit);
        stores = await this.fetchStoresOrderedByIds(orderedIds);
      } else {
        const orderedIds = await this.getStoreIdsOrderedByDistance(
          idList,
          page,
          limit,
          latitude!,
          longitude!,
        );
        stores = await this.fetchStoresOrderedByIds(orderedIds);
      }
    } else {
      const orderBy = this.buildStoreOrderBy(sort);
      const skip = (page - 1) * limit;
      stores = await this.prisma.store.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      });
    }

    const storeResponses = (await StoreMapperUtil.mapToStoreResponse(
      stores,
      this.prisma,
    )) as StoreResponseDto[];

    if (user?.sub) {
      const likedStoreIds = await this.getLikedStoreIds(
        user.sub,
        stores.map((s) => s.id),
      );
      for (const res of storeResponses) {
        res.isLiked = likedStoreIds.has(res.id);
      }
    }

    const meta = calculatePaginationMeta(page, limit, totalItems);
    return { data: storeResponses, meta };
  }

  /**
   * 스토어 상세 조회 (사용자용)
   * 로그인한 경우 해당 스토어의 좋아요 여부(isLiked)를 반환합니다.
   */
  async getStoreByIdForUser(storeId: string, user?: JwtVerifiedPayload) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      LoggerUtil.log(`스토어 상세 조회 실패: 스토어 없음 - storeId: ${storeId}`);
      throw new NotFoundException(STORE_ERROR_MESSAGES.NOT_FOUND);
    }

    // 좋아요 여부 확인 (로그인한 사용자의 경우)
    let isLiked: boolean | null = null;
    if (user?.sub) {
      try {
        isLiked = await this.likeStoreDetailService.isStoreLiked(user.sub, storeId);
      } catch (error: unknown) {
        // 스토어 삭제 등 경합으로 좋아요 조회 시점에 대상이 사라진 경우에만 null 처리
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
        isLiked = null;
      }
    }

    const storeResponse = (await StoreMapperUtil.mapToStoreResponse(
      store,
      this.prisma,
    )) as StoreResponseDto;
    storeResponse.isLiked = isLiked;

    return storeResponse;
  }

  /**
   * 내 스토어 목록 조회 (판매자용)
   * 검색(스토어명), 정렬, 페이지네이션, 상품 필터(sizes, minPrice, maxPrice, productCategoryTypes)를 지원합니다.
   */
  async getStoresByUserIdForSeller(userId: string, query: GetSellerStoresRequestDto) {
    const {
      search,
      page,
      limit,
      sortBy,
      sizes,
      minPrice,
      maxPrice,
      productCategoryTypes,
      latitude,
      longitude,
      pickupFilterDate,
      pickupFilterPeriod,
    } = query;

    const hasPickupDate = Boolean(pickupFilterDate?.trim());
    const hasPickupPeriod = pickupFilterPeriod != null;
    if (hasPickupDate !== hasPickupPeriod) {
      throw new BadRequestException(STORE_ERROR_MESSAGES.PICKUP_FILTER_DATE_PERIOD_PAIR);
    }

    const baseWhere = this.buildStoreWhereForSeller(userId, search);
    const productFilterWhere = await this.buildStoreWhereProductFilter({
      sizes,
      minPrice,
      maxPrice,
      productCategoryTypes,
    });
    const mergedBase: Prisma.StoreWhereInput =
      Object.keys(productFilterWhere).length > 0
        ? { AND: [baseWhere, productFilterWhere] }
        : baseWhere;
    const { where, totalItems: pickupTotalItems } = await this.narrowStoreWhereByMapPickupFilter(
      mergedBase,
      pickupFilterDate?.trim(),
      pickupFilterPeriod,
    );
    const sort = sortBy ?? StoreSortBy.LATEST;

    if (sort === StoreSortBy.DISTANCE) {
      if (latitude === undefined || longitude === undefined) {
        throw new BadRequestException(PRODUCT_ERROR_MESSAGES.DISTANCE_SORT_REQUIRES_COORDINATES);
      }
    }

    const totalItems =
      pickupTotalItems !== null ? pickupTotalItems : await this.prisma.store.count({ where });

    let stores: Store[];

    if (sort === StoreSortBy.RATING_AVG || sort === StoreSortBy.DISTANCE) {
      const allMatching = await this.prisma.store.findMany({ where, select: { id: true } });
      const idList = allMatching.map((s) => s.id);
      if (idList.length === 0) {
        stores = [];
      } else if (sort === StoreSortBy.RATING_AVG) {
        const orderedIds = await this.getStoreIdsOrderedByRating(idList, page, limit);
        stores = await this.fetchStoresOrderedByIds(orderedIds);
      } else {
        const orderedIds = await this.getStoreIdsOrderedByDistance(
          idList,
          page,
          limit,
          latitude!,
          longitude!,
        );
        stores = await this.fetchStoresOrderedByIds(orderedIds);
      }
    } else {
      const orderBy = this.buildStoreOrderBy(sort);
      const skip = (page - 1) * limit;
      stores = await this.prisma.store.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      });
    }

    const storeResponses = (await StoreMapperUtil.mapToStoreResponse(
      stores,
      this.prisma,
    )) as StoreResponseDto[];

    const likedStoreIds = await this.getLikedStoreIds(
      userId,
      stores.map((s) => s.id),
    );
    for (const res of storeResponses) {
      res.isLiked = likedStoreIds.has(res.id);
    }

    const meta = calculatePaginationMeta(page, limit, totalItems);
    return { data: storeResponses, meta };
  }

  /**
   * 내 스토어 상세 조회 (판매자용)
   * 자신이 소유한 스토어만 조회 가능합니다.
   */
  async getStoreByIdForSeller(storeId: string, user: JwtVerifiedPayload) {
    await StoreOwnershipUtil.verifyStoreOwnership(this.prisma, storeId, user.sub);

    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      LoggerUtil.log(`스토어 상세 조회 실패: 스토어 없음 - storeId: ${storeId}`);
      throw new NotFoundException(STORE_ERROR_MESSAGES.NOT_FOUND);
    }

    let isLiked: boolean | null = null;
    try {
      isLiked = await this.likeStoreDetailService.isStoreLiked(user.sub, storeId);
    } catch (error: unknown) {
      if (!(error instanceof NotFoundException)) {
        throw error;
      }
      isLiked = null;
    }

    const storeResponse = (await StoreMapperUtil.mapToStoreResponse(
      store,
      this.prisma,
    )) as StoreResponseDto;
    storeResponse.isLiked = isLiked;

    return storeResponse;
  }

  /**
   * 픽업 일·구간 필터: Prisma where만으로 표현하기 어려운 영업 캘린더를 메모리에서 좁힌 뒤 id IN으로 반영.
   * @returns totalItems가 null이면 호출부에서 prisma.count로 계산.
   */
  private async narrowStoreWhereByMapPickupFilter(
    baseWhere: Prisma.StoreWhereInput,
    pickupFilterDate?: string,
    pickupFilterPeriod?: StoreMapPickupPeriodKind,
  ): Promise<{ where: Prisma.StoreWhereInput; totalItems: number | null }> {
    if (!pickupFilterDate || pickupFilterPeriod == null) {
      return { where: baseWhere, totalItems: null };
    }

    const rows = await this.prisma.store.findMany({
      where: baseWhere,
      select: {
        id: true,
        weeklyClosedWeekdays: true,
        standardOpenTime: true,
        standardCloseTime: true,
        businessCalendarOverrides: true,
      },
    });

    const filteredIds = rows
      .filter((r) => storeRowMatchesMapPickupFilter(r, pickupFilterDate, pickupFilterPeriod))
      .map((r) => r.id);

    if (filteredIds.length === 0) {
      return {
        where: { AND: [baseWhere, { id: "never" }] },
        totalItems: 0,
      };
    }

    return {
      where: { AND: [baseWhere, { id: { in: filteredIds } }] },
      totalItems: filteredIds.length,
    };
  }

  private async buildStoreWhereForUser(params: {
    search?: string;
    regions?: string;
    sizes?: string[];
    minPrice?: number;
    maxPrice?: number;
    productCategoryTypes?: ProductCategoryType[];
  }): Promise<Prisma.StoreWhereInput> {
    const conditions: Prisma.StoreWhereInput[] = [];

    if (params.search?.trim()) {
      conditions.push(buildStoreKeywordSearchWhere(params.search));
    }

    const parsedRegions = parseRegionsParam(params.regions);
    const regionWhere = buildStoreWhereInputForRegions(parsedRegions);
    if (regionWhere) {
      conditions.push(regionWhere);
    }

    const productFilterWhere = await this.buildStoreWhereProductFilter({
      sizes: params.sizes,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      productCategoryTypes: params.productCategoryTypes,
    });
    if (Object.keys(productFilterWhere).length > 0) {
      conditions.push(productFilterWhere);
    }

    if (conditions.length === 0) return {};
    if (conditions.length === 1) return conditions[0];
    return { AND: conditions };
  }

  /**
   * 상품 필터만 적용한 스토어 where 조건 (sizes, minPrice, maxPrice, productCategoryTypes).
   * 스토어 목록(사용자/판매자), 마이페이지 좋아요 스토어 목록 등에서 공통 사용.
   */
  private async buildStoreWhereProductFilter(params: {
    sizes?: string[];
    minPrice?: number;
    maxPrice?: number;
    productCategoryTypes?: ProductCategoryType[];
  }): Promise<Prisma.StoreWhereInput> {
    const hasProductFilter =
      (params.sizes?.length ?? 0) > 0 ||
      params.minPrice != null ||
      params.maxPrice != null ||
      (params.productCategoryTypes?.length ?? 0) > 0;
    if (!hasProductFilter) return {};

    const conditions: Prisma.StoreWhereInput[] = [];

    if (params.sizes && params.sizes.length > 0) {
      const storeIdsFromSize = await this.getStoreIdsWithProductSizes(params.sizes);
      if (storeIdsFromSize.length === 0) return { id: "never" };
      conditions.push({ id: { in: storeIdsFromSize } });
    }

    const productSome: Prisma.ProductWhereInput = {
      visibilityStatus: EnableStatus.ENABLE,
      salesStatus: EnableStatus.ENABLE,
    };
    if (params.minPrice != null || params.maxPrice != null) {
      productSome.salePrice = {};
      if (params.minPrice != null) {
        (productSome.salePrice as Prisma.IntFilter).gte = params.minPrice;
      }
      if (params.maxPrice != null) {
        (productSome.salePrice as Prisma.IntFilter).lte = params.maxPrice;
      }
    }
    if (params.productCategoryTypes && params.productCategoryTypes.length > 0) {
      productSome.productCategoryTypes = { hasSome: params.productCategoryTypes };
    }
    conditions.push({ products: { some: productSome } });

    return conditions.length === 1 ? conditions[0]! : { AND: conditions };
  }

  /**
   * 케이크 사이즈 옵션(도시락, 미니, 1호 등)을 가진 상품이 하나라도 있는 스토어 ID 목록 조회
   */
  private async getStoreIdsWithProductSizes(sizes: string[]): Promise<string[]> {
    if (sizes.length === 0) return [];
    const result = await this.prisma.$queryRaw<Array<{ store_id: string }>>(
      Prisma.sql`
        SELECT DISTINCT p.store_id
        FROM products p
        WHERE p.visibility_status = ${EnableStatus.ENABLE}
          AND p.sales_status = ${EnableStatus.ENABLE}
          AND p.cake_size_options IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM jsonb_array_elements(p.cake_size_options::jsonb) AS elem
            WHERE elem->>'displayName' IN (${Prisma.join(sizes)})
          )
      `,
    );
    return result.map((r) => r.store_id);
  }

  private buildStoreWhereForSeller(userId: string, search?: string): Prisma.StoreWhereInput {
    const where: Prisma.StoreWhereInput = { sellerId: userId };
    if (search?.trim()) {
      const keyword = search.trim();
      where.name = { contains: keyword, mode: "insensitive" };
    }
    return where;
  }

  private buildStoreOrderBy(
    sortBy: StoreSortBy,
  ): Prisma.StoreOrderByWithRelationInput | Prisma.StoreOrderByWithRelationInput[] {
    switch (sortBy) {
      case StoreSortBy.POPULAR:
        return { likeCount: "desc" };
      case StoreSortBy.LATEST:
      default:
        return { createdAt: "desc" };
    }
  }

  /** 필터에 맞는 스토어 id 목록을 평균 별점 내림차순으로 페이지네이션 */
  private async getStoreIdsOrderedByRating(
    storeIds: string[],
    page: number,
    limit: number,
  ): Promise<string[]> {
    if (storeIds.length === 0) return [];
    const skip = (page - 1) * limit;
    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>(
      Prisma.sql`
        SELECT s.id
        FROM stores s
        LEFT JOIN products p ON p.store_id = s.id
        LEFT JOIN product_reviews pr ON pr.product_id = p.id AND pr.deleted_at IS NULL
        WHERE s.id IN (${Prisma.join(storeIds)})
        GROUP BY s.id, s.created_at
        ORDER BY COALESCE(AVG(pr.rating), 0) DESC, s.created_at DESC
        LIMIT ${limit}
        OFFSET ${skip}
      `,
    );
    return rows.map((r) => r.id);
  }

  /** 필터에 맞는 스토어 id 목록을 기준점까지 구면 거리(근사, m) 오름차순으로 페이지네이션. 좌표 없는 스토어는 뒤로 */
  private async getStoreIdsOrderedByDistance(
    storeIds: string[],
    page: number,
    limit: number,
    userLat: number,
    userLng: number,
  ): Promise<string[]> {
    if (storeIds.length === 0) return [];
    const skip = (page - 1) * limit;
    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>(
      Prisma.sql`
        SELECT s.id
        FROM stores s
        WHERE s.id IN (${Prisma.join(storeIds)})
        ORDER BY
          CASE WHEN s.latitude IS NULL OR s.longitude IS NULL THEN 1 ELSE 0 END ASC,
          (
            6371000 * acos(
              LEAST(
                1::double precision,
                GREATEST(
                  -1::double precision,
                  cos(radians(${userLat})) * cos(radians(s.latitude)) * cos(radians(s.longitude) - radians(${userLng})) +
                  sin(radians(${userLat})) * sin(radians(s.latitude))
                )
              )
            )
          ) ASC NULLS LAST,
          s.created_at DESC
        LIMIT ${limit}
        OFFSET ${skip}
      `,
    );
    return rows.map((r) => r.id);
  }

  private async fetchStoresOrderedByIds(orderedIds: string[]): Promise<Store[]> {
    if (orderedIds.length === 0) return [];
    const stores = await this.prisma.store.findMany({
      where: { id: { in: orderedIds } },
    });
    const map = new Map(stores.map((s) => [s.id, s]));
    return orderedIds.map((id) => map.get(id)).filter((s): s is Store => s !== undefined);
  }

  /**
   * 지역별 스토어 수 계산
   * STORE_REGION_DEPTHS 구조를 유지하면서
   * - 각 2depth 항목에 storeCount를 붙이고
   * - 각 1depth 항목에는 "전지역"에 해당하는 스토어 수(또는 2depth 합계)를 storeCount로 설정합니다.
   */
  async getRegionCounts(): Promise<
    Array<{
      depth1: { label: string; searchKeywords: readonly string[]; storeCount: number };
      depth2: Array<{ label: string; searchKeywords: readonly string[]; storeCount: number }>;
    }>
  > {
    const tasks: Promise<number>[] = [];
    for (const group of STORE_REGION_DEPTHS) {
      const depth1Keywords = [...group.depth1.searchKeywords];
      // depth1의 검색 키워드로 전국 여부 판별 (예: ["전지역"])
      const isNationwide = depth1Keywords.length === 1 && depth1Keywords[0] === "전지역";
      for (const d2 of group.depth2) {
        const depth2Keywords = d2.label === "전지역" ? [] : [...d2.searchKeywords];
        const where = isNationwide
          ? {}
          : buildStoreWhereForRegionKeywords(depth1Keywords, depth2Keywords);
        tasks.push(this.prisma.store.count({ where }));
      }
    }
    const counts = await Promise.all(tasks);
    let k = 0;

    return STORE_REGION_DEPTHS.map((group) => {
      let depth1StoreCount: number | null = null;
      const depth2WithCounts = group.depth2.map((d2) => {
        const storeCount = counts[k++];
        if (d2.label === "전지역") {
          depth1StoreCount = storeCount;
        }
        return { ...d2, storeCount };
      });

      // "전지역" 항목이 없는 경우(이상 상황)에는 2depth 합계로 보정
      if (depth1StoreCount === null) {
        depth1StoreCount = depth2WithCounts.reduce((sum, d2) => sum + d2.storeCount, 0);
      }

      return {
        depth1: { ...group.depth1, storeCount: depth1StoreCount },
        depth2: depth2WithCounts,
      };
    });
  }

  /**
   * 여러 스토어에 대한 좋아요 여부를 한 번에 조회 (N+1 방지)
   */
  private async getLikedStoreIds(userId: string, storeIds: string[]): Promise<Set<string>> {
    if (storeIds.length === 0) return new Set<string>();
    const likes = await this.prisma.storeLike.findMany({
      where: { consumerId: userId, storeId: { in: storeIds } },
      select: { storeId: true },
    });
    return new Set(likes.map((l) => l.storeId));
  }
}
