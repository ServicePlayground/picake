import { afterAll, afterEach, beforeAll } from "vitest";

import { connectTestDb, disconnectTestDb, resetDatabase } from "@apps/backend/test/integration/db";

beforeAll(async () => {
  await connectTestDb();
});

afterEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await disconnectTestDb();
});
