import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "@apps/backend/infra/database/prisma.service";
import {
  GetProductsRequestDto,
  GetSellerProductsRequestDto,
} from "@apps/backend/modules/product/dto/product-list.dto";
import {
  EnableStatus,
  ProductType,
  ProductCategoryType,
  SortBy,
  PRODUCT_ERROR_MESSAGES,
} from "@apps/backend/modules/product/constants/product.constants";
import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import { ProductMapperUtil } from "@apps/backend/modules/product/utils/product-mapper.util";
import { calculatePaginationMeta } from "@apps/backend/common/utils/pagination.util";
import { JwtVerifiedPayload } from "@apps/backend/modules/auth/types/auth.types";
import { LoggerUtil } from "@apps/backend/common/utils/logger.util";
import {
  parseRegionsParam,
  buildStoreWhereInputForRegions,
} from "@apps/backend/modules/store/utils/region-filter.util";
import {
  buildProductKeywordOrConditions,
  buildProductKeywordSearchSqlCondition,
} from "@apps/backend/modules/product/utils/product-search.util";

@Injectable()
export class ProductListService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 여러 상품에 대한 좋아요 여부를 한 번에 조회 (N+1 문제 방지)
   * @param userId - 사용자 ID
   * @param productIds - 상품 ID 목록
   * @returns 좋아요한 상품 ID Set
   */
  private async getLikedProductIds(userId: string, productIds: string[]): Promise<Set<string>> {
    if (productIds.length === 0) {
      return new Set<string>();
    }

    const likes = await this.prisma.productLike.findMany({
      where: {
        consumerId: userId,
        productId: {
          in: productIds,
        },
      },
      select: {
        productId: true,
      },
    });

    return new Set(likes.map((like) => like.productId));
  }

  private buildReviewSortFilterSql(params: {
    onlyVisible?: boolean;
    userStoreIds?: string[];
    storeIds?: string[];
    storeId?: string;
    salesStatus?: EnableStatus;
    visibilityStatus?: EnableStatus;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    productType?: ProductType;
    productCategoryTypes?: ProductCategoryType[];
    sizes?: string[];
  }): Prisma.Sql {
    const conditions: Prisma.Sql[] = [];

    if (params.onlyVisible) {
      conditions.push(Prisma.sql`p.visibility_status::text = ${EnableStatus.ENABLE}`);
    }

    if (params.userStoreIds && params.userStoreIds.length > 0) {
      conditions.push(Prisma.sql`p.store_id IN (${Prisma.join(params.userStoreIds)})`);
    }

    if (params.storeIds !== undefined) {
      if (params.storeIds.length === 0) {
        conditions.push(Prisma.sql`FALSE`);
      } else {
        conditions.push(Prisma.sql`p.store_id IN (${Prisma.join(params.storeIds)})`);
      }
    } else if (params.storeId) {
      conditions.push(Prisma.sql`p.store_id = ${params.storeId}`);
    }

    if (params.salesStatus !== undefined) {
      conditions.push(Prisma.sql`p.sales_status::text = ${params.salesStatus}`);
    }

    if (params.visibilityStatus !== undefined) {
      conditions.push(Prisma.sql`p.visibility_status::text = ${params.visibilityStatus}`);
    }

    if (params.search) {
      conditions.push(buildProductKeywordSearchSqlCondition(params.search));
    }

    if (params.minPrice !== undefined) {
      conditions.push(Prisma.sql`p.sale_price >= ${params.minPrice}`);
    }

    if (params.maxPrice !== undefined) {
      conditions.push(Prisma.sql`p.sale_price <= ${params.maxPrice}`);
    }

    if (params.productType) {
      conditions.push(Prisma.sql`p.product_type::text = ${params.productType}`);
    }

    if (params.productCategoryTypes && params.productCategoryTypes.length > 0) {
      conditions.push(
        Prisma.sql`p.product_category_types::text[] && ARRAY[${Prisma.join(params.productCategoryTypes)}]::text[]`,
      );
    }

    if (params.sizes && params.sizes.length > 0) {
      conditions.push(
        Prisma.sql`p.cake_size_options IS NOT NULL AND EXISTS (
          SELECT 1 FROM jsonb_array_elements(p.cake_size_options::jsonb) AS elem
          WHERE elem->>'displayName' IN (${Prisma.join(params.sizes)})
        )`,
      );
    }

    if (conditions.length === 0) {
      return Prisma.sql`TRUE`;
    }

    return Prisma.sql`${Prisma.join(conditions, " AND ")}`;
  }

  /**
   * cakeSizeOptions.displayName이 지정된 사이즈 중 하나와 일치하는 상품 ID 목록 (스토어 목록의 사이즈 필터와 동일한 JSONB 조건)
   */
  private async getProductIdsMatchingCakeSizes(sizes: string[]): Promise<string[]> {
    if (sizes.length === 0) return [];
    const result = await this.prisma.$queryRaw<Array<{ id: string }>>(
      Prisma.sql`
        SELECT DISTINCT p.id
        FROM products p
        WHERE p.cake_size_options IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM jsonb_array_elements(p.cake_size_options::jsonb) AS elem
            WHERE elem->>'displayName' IN (${Prisma.join(sizes)})
          )
      `,
    );
    return result.map((r) => r.id);
  }

  private async getProductIdsByReviewSort(
    filterSql: Prisma.Sql,
    sortBy: SortBy.REVIEW_COUNT | SortBy.RATING_AVG,
    page: number,
    limit: number,
  ): Promise<string[]> {
    const skip = (page - 1) * limit;
    const orderBySql =
      sortBy === SortBy.REVIEW_COUNT
        ? Prisma.sql`COUNT(pr.id) DESC, p.created_at DESC`
        : Prisma.sql`COALESCE(AVG(pr.rating), 0) DESC, p.created_at DESC`;

    const rows = await this.prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
      SELECT p.id
      FROM products p
      LEFT JOIN product_reviews pr ON pr.product_id = p.id AND pr.deleted_at IS NULL
      WHERE ${filterSql}
      GROUP BY p.id, p.created_at
      ORDER BY ${orderBySql}
      LIMIT ${limit}
      OFFSET ${skip}
    `);

    return rows.map((row) => row.id);
  }

  private async getProductIdsByDistanceSort(
    filterSql: Prisma.Sql,
    userLat: number,
    userLng: number,
    page: number,
    limit: number,
  ): Promise<string[]> {
    const skip = (page - 1) * limit;
    const rows = await this.prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
      SELECT p.id
      FROM products p
      INNER JOIN stores st ON st.id = p.store_id
      WHERE ${filterSql}
      ORDER BY
        CASE WHEN st.latitude IS NULL OR st.longitude IS NULL THEN 1 ELSE 0 END ASC,
        (
          6371000 * acos(
            LEAST(
              1::double precision,
              GREATEST(
                -1::double precision,
                cos(radians(${userLat})) * cos(radians(st.latitude)) * cos(radians(st.longitude) - radians(${userLng})) +
                sin(radians(${userLat})) * sin(radians(st.latitude))
              )
            )
          )
        ) ASC NULLS LAST,
        p.created_at DESC
      LIMIT ${limit}
      OFFSET ${skip}
    `);
    return rows.map((row) => row.id);
  }

  /**
   * 공통 필터 조건 추가 (검색어, 가격, 상품 타입, 상품 카테고리 타입)
   */
  private addCommonFilters(
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
   * 상품 목록 조회 (사용자용)
   * 필터링, 정렬, 무한스크롤을 지원합니다.
   */
  async getProductsForUser(query: GetProductsRequestDto, user?: JwtVerifiedPayload) {
    const {
      search,
      page,
      limit,
      sortBy,
      minPrice,
      maxPrice,
      storeId,
      productType,
      productCategoryTypes,
      regions,
      sizes,
      latitude,
      longitude,
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

    const where: Prisma.ProductWhereInput & { AND?: Prisma.ProductWhereInput[] } = {
      visibilityStatus: EnableStatus.ENABLE,
    };

    if (storeIdsFromRegion !== undefined) {
      where.storeId = { in: storeIdsFromRegion };
    } else if (storeId) {
      where.storeId = storeId;
    }

    this.addCommonFilters(where, search, minPrice, maxPrice, productType, productCategoryTypes);

    if (sizes?.length) {
      const sizeIds = await this.getProductIdsMatchingCakeSizes(sizes);
      where.AND = where.AND || [];
      if (sizeIds.length === 0) {
        where.AND.push({ id: "never" });
      } else {
        where.AND.push({ id: { in: sizeIds } });
      }
    }

    const totalItems = await this.prisma.product.count({ where });

    const needsReviewData = sortBy === SortBy.REVIEW_COUNT || sortBy === SortBy.RATING_AVG;
    const needsDistanceSort = sortBy === SortBy.DISTANCE;

    if (needsDistanceSort && (latitude === undefined || longitude === undefined)) {
      throw new BadRequestException(PRODUCT_ERROR_MESSAGES.DISTANCE_SORT_REQUIRES_COORDINATES);
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput[] = [];
    let products;

    if (needsReviewData || needsDistanceSort) {
      const filterSql = this.buildReviewSortFilterSql({
        onlyVisible: true,
        storeIds: storeIdsFromRegion,
        storeId: storeIdsFromRegion === undefined ? storeId : undefined,
        search,
        minPrice,
        maxPrice,
        productType,
        productCategoryTypes,
        sizes,
      });

      const productIds = needsDistanceSort
        ? await this.getProductIdsByDistanceSort(filterSql, latitude!, longitude!, page, limit)
        : await this.getProductIdsByReviewSort(
            filterSql,
            sortBy as SortBy.REVIEW_COUNT | SortBy.RATING_AVG,
            page,
            limit,
          );

      const productsWithStore = await this.prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
        include: {
          reviews: ProductMapperUtil.REVIEWS_INCLUDE_FOR_STATS,
          store: {
            select: ProductMapperUtil.STORE_INFO_SELECT,
          },
        },
      });

      const productsById = new Map(productsWithStore.map((product) => [product.id, product]));
      const orderedProducts = productIds
        .map((id) => productsById.get(id))
        .filter((product): product is NonNullable<typeof product> => Boolean(product));

      const likedProductIds = user?.sub
        ? await this.getLikedProductIds(user.sub, productIds)
        : new Set<string>();

      products = orderedProducts.map((product) =>
        ProductMapperUtil.mapToProductResponse(
          product,
          user?.sub ? likedProductIds.has(product.id) : null,
        ),
      );
    } else {
      switch (sortBy) {
        case SortBy.LATEST:
          orderBy = [{ createdAt: "desc" }];
          break;
        case SortBy.PRICE_ASC:
          orderBy = [{ salePrice: "asc" }, { createdAt: "desc" }];
          break;
        case SortBy.PRICE_DESC:
          orderBy = [{ salePrice: "desc" }, { createdAt: "desc" }];
          break;
        case SortBy.POPULAR:
        default:
          orderBy = [{ likeCount: "desc" }, { createdAt: "desc" }];
          break;
      }

      const skip = (page - 1) * limit;

      const productsWithStore = await this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          reviews: ProductMapperUtil.REVIEWS_INCLUDE_FOR_STATS,
          store: {
            select: ProductMapperUtil.STORE_INFO_SELECT,
          },
        },
      });

      const productIds = productsWithStore.map((p) => p.id);
      const likedProductIds = user?.sub
        ? await this.getLikedProductIds(user.sub, productIds)
        : new Set<string>();

      products = productsWithStore.map((product) =>
        ProductMapperUtil.mapToProductResponse(
          product,
          user?.sub ? likedProductIds.has(product.id) : null,
        ),
      );
    }

    const data = products;
    const meta = calculatePaginationMeta(page, limit, totalItems);

    return { data, meta };
  }

  /**
   * 판매자용 상품 목록 조회 (판매자용)
   * 자신이 소유한 스토어의 상품만 조회합니다.
   */
  async getProductsForSeller(query: GetSellerProductsRequestDto, user: JwtVerifiedPayload) {
    const {
      search,
      page,
      limit,
      sortBy,
      minPrice,
      maxPrice,
      storeId,
      salesStatus,
      visibilityStatus,
      productType,
      productCategoryTypes,
      sizes,
      latitude,
      longitude,
    } = query;

    const userStores = await this.prisma.store.findMany({
      where: {
        sellerId: user.sub,
      },
      select: {
        id: true,
      },
    });

    const userStoreIds = userStores.map((store) => store.id);

    if (userStoreIds.length === 0) {
      return {
        data: [],
        meta: calculatePaginationMeta(page, limit, 0),
      };
    }

    const where: Prisma.ProductWhereInput & { AND?: Prisma.ProductWhereInput[] } = {
      storeId: {
        in: userStoreIds,
      },
    };

    if (storeId) {
      if (!userStoreIds.includes(storeId)) {
        LoggerUtil.log(
          `상품 목록 조회 실패: 스토어 소유권 없음 - userId: ${user.sub}, storeId: ${storeId}`,
        );
        throw new ForbiddenException(PRODUCT_ERROR_MESSAGES.STORE_NOT_OWNED);
      }
      where.storeId = storeId;
    }

    if (salesStatus !== undefined) {
      where.salesStatus = salesStatus;
    }

    if (visibilityStatus !== undefined) {
      where.visibilityStatus = visibilityStatus;
    }

    this.addCommonFilters(where, search, minPrice, maxPrice, productType, productCategoryTypes);

    if (sizes?.length) {
      const sizeIds = await this.getProductIdsMatchingCakeSizes(sizes);
      where.AND = where.AND || [];
      if (sizeIds.length === 0) {
        where.AND.push({ id: "never" });
      } else {
        where.AND.push({ id: { in: sizeIds } });
      }
    }

    const totalItems = await this.prisma.product.count({ where });

    const needsReviewData = sortBy === SortBy.REVIEW_COUNT || sortBy === SortBy.RATING_AVG;
    const needsDistanceSort = sortBy === SortBy.DISTANCE;

    if (needsDistanceSort && (latitude === undefined || longitude === undefined)) {
      throw new BadRequestException(PRODUCT_ERROR_MESSAGES.DISTANCE_SORT_REQUIRES_COORDINATES);
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput[] = [];
    let products;

    if (needsReviewData || needsDistanceSort) {
      const filterSql = this.buildReviewSortFilterSql({
        userStoreIds,
        storeId,
        salesStatus,
        visibilityStatus,
        search,
        minPrice,
        maxPrice,
        productType,
        productCategoryTypes,
        sizes,
      });

      const productIds = needsDistanceSort
        ? await this.getProductIdsByDistanceSort(filterSql, latitude!, longitude!, page, limit)
        : await this.getProductIdsByReviewSort(
            filterSql,
            sortBy as SortBy.REVIEW_COUNT | SortBy.RATING_AVG,
            page,
            limit,
          );

      const productsWithStore = await this.prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
        include: {
          reviews: ProductMapperUtil.REVIEWS_INCLUDE_FOR_STATS,
          store: {
            select: ProductMapperUtil.STORE_INFO_SELECT,
          },
        },
      });

      const productsById = new Map(productsWithStore.map((product) => [product.id, product]));
      const orderedProducts = productIds
        .map((id) => productsById.get(id))
        .filter((product): product is NonNullable<typeof product> => Boolean(product));

      const likedProductIds = await this.getLikedProductIds(user.sub, productIds);

      products = orderedProducts.map((product) =>
        ProductMapperUtil.mapToProductResponse(product, likedProductIds.has(product.id)),
      );
    } else {
      switch (sortBy) {
        case SortBy.LATEST:
          orderBy = [{ createdAt: "desc" }];
          break;
        case SortBy.PRICE_ASC:
          orderBy = [{ salePrice: "asc" }, { createdAt: "desc" }];
          break;
        case SortBy.PRICE_DESC:
          orderBy = [{ salePrice: "desc" }, { createdAt: "desc" }];
          break;
        case SortBy.POPULAR:
        default:
          orderBy = [{ likeCount: "desc" }, { createdAt: "desc" }];
          break;
      }

      const skip = (page - 1) * limit;

      const productsWithStore = await this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          reviews: ProductMapperUtil.REVIEWS_INCLUDE_FOR_STATS,
          store: {
            select: ProductMapperUtil.STORE_INFO_SELECT,
          },
        },
      });

      const productIds = productsWithStore.map((p) => p.id);
      const likedProductIds = await this.getLikedProductIds(user.sub, productIds);

      products = productsWithStore.map((product) =>
        ProductMapperUtil.mapToProductResponse(product, likedProductIds.has(product.id)),
      );
    }

    const data = products;
    const meta = calculatePaginationMeta(page, limit, totalItems);

    return { data, meta };
  }
}
