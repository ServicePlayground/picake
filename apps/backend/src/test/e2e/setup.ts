import { afterAll, afterEach, beforeAll } from "vitest";

import { closeTestApp, createTestApp } from "@apps/backend/test/e2e/app";
import { connectTestDb, disconnectTestDb, resetDatabase } from "@apps/backend/test/integration/db";

beforeAll(async () => {
  await createTestApp();
  // resetDatabase()용 별도 연결. 앱 내부 PrismaService와는 다른 커넥션이지만
  // 같은 DB를 보므로 TRUNCATE 가시성에는 문제없다.
  await connectTestDb();
});

afterEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await disconnectTestDb();
  await closeTestApp();
});
