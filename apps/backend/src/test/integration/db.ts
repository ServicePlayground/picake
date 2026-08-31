import { ConfigModule } from "@nestjs/config";
import { Test } from "@nestjs/testing";

import { PrismaService } from "@apps/backend/infra/database/prisma.service";

let prisma: PrismaService | undefined;

/**
 * 실수로 dev/staging/production DB에 대고 TRUNCATE를 날리는 사고를 막기 위한 안전장치.
 * 반드시 `dotenv -e ./.env.test`로 실행해서 DATABASE_URL이 테스트 DB를 가리키도록 해야 함.
 */
function assertTestDatabase(): void {
  const url = process.env.DATABASE_URL ?? "";
  if (!url.includes("_test")) {
    throw new Error(
      `DATABASE_URL이 테스트 DB(이름에 "_test" 포함)를 가리키고 있지 않습니다: ${url}\n` +
        `"yarn test:integration"으로 실행했는지 확인하세요.`,
    );
  }
}

export async function connectTestDb(): Promise<PrismaService> {
  if (prisma) return prisma;

  assertTestDatabase();

  const moduleRef = await Test.createTestingModule({
    imports: [ConfigModule.forRoot({ ignoreEnvFile: true, isGlobal: true })],
    providers: [PrismaService],
  }).compile();

  prisma = moduleRef.get(PrismaService);
  await moduleRef.init();
  return prisma;
}

export async function disconnectTestDb(): Promise<void> {
  if (!prisma) return;
  await prisma.$disconnect();
  prisma = undefined;
}

export function getTestPrisma(): PrismaService {
  if (!prisma) {
    throw new Error("connectTestDb()를 먼저 호출해야 합니다.");
  }
  return prisma;
}

/**
 * 테스트 DB의 모든 테이블(마이그레이션 이력 테이블 제외)을 비웁니다.
 * 스키마가 계속 바뀌어도 유지보수할 필요가 없도록 테이블 목록을 하드코딩하지 않고 조회합니다.
 */
export async function resetDatabase(): Promise<void> {
  assertTestDatabase();
  const db = getTestPrisma();

  const tables = await db.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename != '_prisma_migrations'
  `;

  if (tables.length === 0) return;

  const tableList = tables.map((t) => `"${t.tablename}"`).join(", ");
  await db.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE;`);
}
