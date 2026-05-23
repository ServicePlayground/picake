import { Injectable } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import {
  GetStoresRequestDto,
  StoreListResponseDto,
} from "@apps/backend/modules/store/dto/store-list.dto";
import {
  GetProductsRequestDto,
  ProductListResponseDto,
} from "@apps/backend/modules/product/dto/product-list.dto";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import { calculatePaginationMeta } from "@apps/backend/common/utils/pagination.util";
import { ProductMapperUtil } from "@apps/backend/modules/product/utils/product-mapper.util";
import { buildProductKeywordOrConditions } from "@apps/backend/modules/product/utils/product-search.util";
import { StoreMapperUtil } from "@apps/backend/modules/store/utils/store-mapper.util";
import { ProductResponseDto } from "@apps/backend/modules/product/dto/product-detail.dto";
import { StoreResponseDto } from "@apps/backend/modules/store/dto/store-detail.dto";
import { StoreSortBy } from "@apps/backend/modules/store/constants/store.constants";
import {
  parseRegionsParam,
  buildStoreWhereInputForRegions,
} from "@apps/backend/modules/store/utils/region-filter.util";
import {
  SortBy,
  EnableStatus,
  ProductType,
  ProductCategoryType,
} from "@apps/backend/modules/product/constants/product.constants";

/**
 * 내가 좋아요한 목록 조회 서비스
 * 사용자가 좋아요한 상품 및 스토어 목록 관련 비즈니스 로직을 처리합니다.
 * 스토어/상품 목록 조회와 동일한 정렬·필터를 지원합니다.
 */
@Injectable()
export class LikeUserListService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 내가 좋아요한 스토어 목록 조회 (사용자용)
   * 정렬(sortBy), 검색(스토어명), 지역·상품 필터(sizes, minPrice, maxPrice, productCategoryTypes), 페이지네이션을 지원합니다.
   */
  async getMyStoreLikesForUser(
    userId: string,
    query: GetStoresRequestDto,
  ): Promise<StoreListResponseDto> {
    const {
      page,
      limit,
      sortBy,
      search,
      regions,
      sizes,
      minPrice,
      maxPrice,
      productCategoryTypes,
    } = query;

    const baseStoreWhere = this.buildStoreWhereForLiked(search, regions);
    const productFilterWhere = await this.buildStoreWhereProductFilterForLiked({
      sizes,
      minPrice,
      maxPrice,
      productCategoryTypes,
    });
    const storeWhere: Prisma.StoreWhereInput =
      Object.keys(productFilterWhere).length > 0
        ? { AND: [baseStoreWhere, productFilterWhere] }
        : baseStoreWhere;
    const orderBy = this.buildStoreOrderByForRelation(sortBy ?? StoreSortBy.LATEST);

    const where: Prisma.StoreLikeWhereInput = {
      consumerId: userId,
      ...(Object.keys(storeWhere).length > 0 ? { store: storeWhere } : {}),
    };

    const totalItems = await this.prisma.storeLike.count({ where });

    const skip = (page - 1) * limit;

    const storeLikes = await this.prisma.storeLike.findMany({
      where,
      orderBy: { store: orderBy as Prisma.StoreOrderByWithRelationInput },
      skip,
      take: limit,
      include: {
        store: true,
      },
    });

    const stores = storeLikes.map((storeLike) => storeLike.store);
    const data = (await StoreMapperUtil.mapToStoreResponse(
      stores,
      this.prisma,
    )) as StoreResponseDto[];

    // 마이페이지 좋아요 목록이므로 모두 좋아요한 스토어
    for (const res of data) {
      res.isLiked = true;
    }

    const meta = calculatePaginationMeta(page, limit, totalItems);

    return { data, meta };
  }

  /**
   * 내가 좋아요한 상품 목록 조회 (사용자용)
   * 정렬(sortBy), 검색, 가격/스토어/타입/카테고리/지역 필터, 페이지네이션을 지원합니다.
   * REVIEW_COUNT, RATING_AVG, DISTANCE 정렬은 relation orderBy 제약으로 인기순(좋아요 수)으로 대체합니다.
   */
  async getMyProductLikesForUser(
    userId: string,
    query: GetProductsRequestDto,
  ): Promise<ProductListResponseDto> {
    const {
      page,
      limit,
      sortBy,
      search,
      minPrice,
      maxPrice,
      storeId,
      productType,
      productCategoryTypes,
      regions,
    } = query;

    let storeIdsFromRegion: string[] | undefined;
    const parsedRegions = parseRegionsParam(regions);
    if (parsedRegions) {
      const regionWhere = buildStoreWhereInputForRegions(parsedRegions);
      if (!regionWhere) {
        storeIdsFromRegion = [];
      } else {
        const stores = await this.prisma.store.findMany({
          where: regionWhere,
          select: { id: true },
        });
        const ids = stores.map((s) => s.id);
        storeIdsFromRegion = storeId ? (ids.includes(storeId) ? [storeId] : []) : ids;
      }
    }

    const productWhere = this.buildProductWhereForLiked(
      search,
      minPrice,
      maxPrice,
      storeId,
      storeIdsFromRegion,
      productType,
      productCategoryTypes,
    );

    const effectiveSortBy =
      sortBy === SortBy.REVIEW_COUNT || sortBy === SortBy.RATING_AVG || sortBy === SortBy.DISTANCE
        ? SortBy.POPULAR
        : sortBy;
    const orderBy = this.buildProductOrderByForRelation(effectiveSortBy);

    const where: Prisma.ProductLikeWhereInput = {
      consumerId: userId,
      product: productWhere,
    };

    const totalItems = await this.prisma.productLike.count({ where });

    const skip = (page - 1) * limit;

    const productLikes = await this.prisma.productLike.findMany({
      where,
      orderBy: { product: orderBy as Prisma.ProductOrderByWithRelationInput },
      skip,
      take: limit,
      include: {
        product: {
          include: {
            store: {
              select: ProductMapperUtil.STORE_INFO_SELECT,
            },
            reviews: ProductMapperUtil.REVIEWS_INCLUDE_FOR_STATS,
          },
        },
      },
    });

    const data: ProductResponseDto[] = productLikes.map((productLike) => {
      return ProductMapperUtil.mapToProductResponse(productLike.product, true);
    });

    const meta = calculatePaginationMeta(page, limit, totalItems);

    return { data, meta };
  }

  /**
   * 스토어 좋아요 목록용 스토어 where (검색, 지역)
   */
  private buildStoreWhereForLiked(search?: string, regions?: string): Prisma.StoreWhereInput {
    const conditions: Prisma.StoreWhereInput[] = [];

    if (search?.trim()) {
      const keyword = search.trim();
      conditions.push({ name: { contains: keyword, mode: "insensitive" } });
    }

    const parsedRegions = parseRegionsParam(regions);
    const regionWhere = buildStoreWhereInputForRegions(parsedRegions);
    if (regionWhere) {
      conditions.push(regionWhere);
    }

    if (conditions.length === 0) return {};
    if (conditions.length === 1) return conditions[0];
    return { AND: conditions };
  }

  /**
   * 스토어 좋아요 목록용 상품 필터 where (sizes, minPrice, maxPrice, productCategoryTypes).
   * 스토어 목록 조회(StoreListService)와 동일한 조건: 해당 상품이 하나라도 있는 스토어만.
   */
  private async buildStoreWhereProductFilterForLiked(params: {
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
   * 케이크 사이즈 옵션(도시락, 미니, 1호 등)을 가진 상품이 하나라도 있는 스토어 ID 목록 조회.
   * StoreListService.getStoreIdsWithProductSizes와 동일 로직 (순환 참조 회피를 위해 여기서 구현).
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

  /**
   * 스토어 좋아요 목록 정렬 (store relation 기준)
   */
  private buildStoreOrderByForRelation(sortBy: StoreSortBy): Prisma.StoreOrderByWithRelationInput {
    switch (sortBy) {
      case StoreSortBy.POPULAR:
        return { likeCount: "desc" };
      case StoreSortBy.RATING_AVG:
      case StoreSortBy.DISTANCE:
        // relation orderBy로는 별점·거리 정렬 불가 → 최신순에 근사
        return { createdAt: "desc" };
      case StoreSortBy.LATEST:
      default:
        return { createdAt: "desc" };
    }
  }

  /**
   * 상품 좋아요 목록용 상품 where (노출상태, 검색, 가격, 스토어, 타입, 카테고리)
   */
  private buildProductWhereForLiked(
    search?: string,
    minPrice?: number,
    maxPrice?: number,
    storeId?: string,
    storeIdsFromRegion?: string[],
    productType?: ProductType,
    productCategoryTypes?: ProductCategoryType[],
  ): Prisma.ProductWhereInput {
    const where: Prisma.ProductWhereInput & { AND?: Prisma.ProductWhereInput[] } = {
      visibilityStatus: EnableStatus.ENABLE,
    };

    if (storeIdsFromRegion !== undefined) {
      where.storeId = { in: storeIdsFromRegion };
    } else if (storeId) {
      where.storeId = storeId;
    }

    this.addProductCommonFilters(
      where,
      search,
      minPrice,
      maxPrice,
      productType,
      productCategoryTypes,
    );

    return where;
  }

  /**
   * 상품 공통 필터 (검색, 가격, 타입, 카테고리) - product-list와 동일
   */
  private addProductCommonFilters(
    where: Prisma.ProductWhereInput & { AND?: Prisma.ProductWhereInput[] },
    search?: string,
    minPrice?: number,
    maxPrice?: number,
    productType?: ProductType,
    productCategoryTypes?: ProductCategoryType[],
  ): void {
    const searchConditions = search ? buildProductKeywordOrConditions(search) : [];

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.salePrice = {};
      if (minPrice !== undefined) where.salePrice.gte = minPrice;
      if (maxPrice !== undefined) where.salePrice.lte = maxPrice;
    }

    if (productType) {
      where.productType = productType;
    }

    if (productCategoryTypes?.length) {
      where.productCategoryTypes = { hasSome: productCategoryTypes };
    }

    if (searchConditions.length > 0) {
      where.AND = where.AND || [];
      where.AND.push({ OR: searchConditions });
    }
  }

  /**
   * 상품 좋아요 목록 정렬 (product relation 기준)
   */
  private buildProductOrderByForRelation(sortBy: SortBy): Prisma.ProductOrderByWithRelationInput {
    switch (sortBy) {
      case SortBy.LATEST:
        return { createdAt: "desc" };
      case SortBy.PRICE_ASC:
        return { salePrice: "asc" };
      case SortBy.PRICE_DESC:
        return { salePrice: "desc" };
      case SortBy.POPULAR:
      case SortBy.REVIEW_COUNT:
      case SortBy.RATING_AVG:
      default:
        return { likeCount: "desc" };
    }
  }
}
