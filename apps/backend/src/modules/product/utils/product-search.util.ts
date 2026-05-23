import { Prisma } from "@apps/backend/infra/database/prisma/generated/client";
import { EnableStatus } from "@apps/backend/modules/product/constants/product.constants";

/**
 * 검색어와 search_tags exact match 시 비교할 변형 목록.
 * 판매자 입력 태그는 `#연인` 형태, 사용자 검색은 `연인`·`#연인` 모두 허용.
 */
export function getProductSearchTagVariants(keyword: string): string[] {
  const trimmed = keyword.trim();
  if (!trimmed) return [];

  const variants = new Set<string>([trimmed]);
  if (trimmed.startsWith("#")) {
    const withoutHash = trimmed.slice(1).trim();
    if (withoutHash) variants.add(withoutHash);
  } else {
    variants.add(`#${trimmed}`);
  }
  return [...variants];
}

/** 사용자 목록·지도 검색에 쓰는 노출·판매 중 상품 조건 */
export const enabledProductListWhere: Prisma.ProductWhereInput = {
  visibilityStatus: EnableStatus.ENABLE,
  salesStatus: EnableStatus.ENABLE,
};

/**
 * 상품명(부분 일치) 또는 검색 태그(exact, # 변형 포함) OR 조건
 * product-list.service addCommonFilters와 동일 의미
 */
export function buildProductKeywordOrConditions(keyword: string): Prisma.ProductWhereInput[] {
  const trimmed = keyword.trim();
  if (!trimmed) return [];

  const tagVariants = getProductSearchTagVariants(trimmed);
  const conditions: Prisma.ProductWhereInput[] = [
    { name: { contains: trimmed, mode: Prisma.QueryMode.insensitive } },
  ];

  if (tagVariants.length > 0) {
    conditions.push({ searchTags: { hasSome: tagVariants } });
  }

  return conditions;
}

/**
 * 스토어 목록 검색: 스토어명 또는 (노출·판매 중) 상품명·검색 태그
 */
export function buildStoreKeywordSearchWhere(keyword: string): Prisma.StoreWhereInput {
  const trimmed = keyword.trim();
  if (!trimmed) return {};

  const productKeywordOr = buildProductKeywordOrConditions(trimmed);
  if (productKeywordOr.length === 0) return {};

  return {
    OR: [
      { name: { contains: trimmed, mode: Prisma.QueryMode.insensitive } },
      {
        products: {
          some: {
            ...enabledProductListWhere,
            OR: productKeywordOr,
          },
        },
      },
    ],
  };
}

/**
 * Raw SQL 상품 검색 조건 (이름 ILIKE + search_tags 배열 overlap)
 */
export function buildProductKeywordSearchSqlCondition(
  keyword: string,
  tableAlias = "p",
): Prisma.Sql {
  const trimmed = keyword.trim();
  const tagVariants = getProductSearchTagVariants(trimmed);
  const nameColumn = Prisma.raw(`${tableAlias}.name`);

  if (tagVariants.length === 0) {
    return Prisma.sql`${nameColumn} ILIKE ${`%${trimmed}%`}`;
  }

  return Prisma.sql`(
    ${nameColumn} ILIKE ${`%${trimmed}%`}
    OR ${Prisma.raw(`${tableAlias}.search_tags`)} && ARRAY[${Prisma.join(tagVariants)}]::text[]
  )`;
}
