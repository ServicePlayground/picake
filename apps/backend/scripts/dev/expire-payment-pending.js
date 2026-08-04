/**
 * 입금대기(PAYMENT_PENDING) 주문을 강제로 "만료" 상태로 만들어, 입금완료 처리 실패 경로를
 * 반복 테스트하기 위한 로컬 전용 스크립트입니다. (개발 DB에서만 사용)
 *
 * 배경: 입금 마감이 지난 뒤 사용자가 "입금완료했어요"를 누르면 주문은 취소완료로 끝납니다.
 * 이때 두 가지가 남아야 합니다.
 *   [1] 사용자가 입력한 입금자명(`depositorName`) — 판매자가 통장 내역과 대조할 근거
 *   [2] 자동 취소 표시(`paymentPendingExpiredAt`) — 의도한 취소가 아니라는 구분값
 * 이 두 가지를 확인할 때 씁니다.
 *
 * 사용법:
 *   node apps/backend/scripts/dev/expire-payment-pending.js setup [주문번호|주문ID]
 *   node apps/backend/scripts/dev/expire-payment-pending.js check [주문번호|주문ID]
 *   node apps/backend/scripts/dev/expire-payment-pending.js restore
 *
 * - setup   : 주문번호(ORD-...)나 주문ID를 주면 그 주문을, 생략하면 가장 최근 입금대기 주문을 만료 상태로 만듭니다.
 *             변경 전 값은 .expire-backup.json에 저장됩니다.
 * - check   : 현재 상태·입금자명·자동 취소 표시를 출력하고 [1][2] 통과 여부를 판정합니다.
 * - restore : setup으로 바꾸기 전 상태로 되돌립니다.
 */
const fs = require("fs");
const path = require("path");

const BACKEND_ROOT = path.resolve(__dirname, "../..");
const BACKUP_PATH = path.join(__dirname, ".expire-backup.json");

// .env.development에서 DATABASE_URL만 읽어옵니다 (NestJS 부팅 없이 Prisma만 사용).
const envPath = path.join(BACKEND_ROOT, ".env.development");
const envLine = fs
  .readFileSync(envPath, "utf8")
  .split("\n")
  .find((line) => line.startsWith("DATABASE_URL="));
if (!envLine) {
  console.error(`DATABASE_URL을 찾을 수 없습니다: ${envPath}`);
  process.exit(1);
}
process.env.DATABASE_URL = envLine
  .slice("DATABASE_URL=".length)
  .trim()
  .replace(/^["']|["']$/g, "");

const { PrismaClient } = require(
  path.join(BACKEND_ROOT, "src/infra/database/prisma/generated/client"),
);

const BACKUP_FIELDS = {
  id: true,
  orderNumber: true,
  orderStatus: true,
  depositorName: true,
  paymentPendingAt: true,
  paymentPendingDeadlineAt: true,
  paymentPendingExpiredAt: true,
  adminRefundRevertReason: true,
  adminRefundRevertedAt: true,
};

/**
 * 주문 ID와 주문번호(ORD-...)를 모두 받습니다. 판매자 화면 목록에는 주문번호만 노출되기 때문입니다.
 * 인자를 생략하면 가장 최근 입금대기 주문을 고릅니다.
 */
async function findOrder(prisma, key) {
  if (!key) {
    return prisma.order.findFirst({
      where: { orderStatus: "PAYMENT_PENDING" },
      orderBy: { createdAt: "desc" },
      select: BACKUP_FIELDS,
    });
  }
  const where = key.startsWith("ORD-") ? { orderNumber: key } : { id: key };
  return prisma.order.findUnique({ where, select: BACKUP_FIELDS });
}

async function setup(prisma, key) {
  const order = await findOrder(prisma, key);

  if (!order) {
    console.error(
      key
        ? `주문을 찾을 수 없습니다: ${key}`
        : "입금대기 상태인 주문이 없습니다. 주문번호나 주문ID를 직접 지정하세요.",
    );
    process.exit(1);
  }

  fs.writeFileSync(BACKUP_PATH, JSON.stringify(order, null, 2));

  const now = Date.now();
  await prisma.order.update({
    where: { id: order.id },
    data: {
      orderStatus: "PAYMENT_PENDING",
      depositorName: null,
      paymentPendingExpiredAt: null, // 이전 회차 흔적 제거 (자동 취소 표시)
      adminRefundRevertReason: null, // 이전 회차 관리자 되돌리기 흔적 제거
      adminRefundRevertedAt: null,
      paymentPendingAt: new Date(now - 13 * 60 * 60 * 1000),
      paymentPendingDeadlineAt: new Date(now - 60 * 1000), // 1분 전 마감 → 만료됨
    },
  });

  console.log(`준비 완료 — 주문 ${order.id} (${order.orderNumber})`);
  console.log(`  변경 전 상태: ${order.orderStatus} / 입금자명 ${order.depositorName ?? "없음"}`);
  console.log(`  백업: ${BACKUP_PATH}`);
  console.log("");
  console.log("이제 손님 앱에서 입금완료를 누르거나 아래를 실행하세요:");
  console.log(
    `  curl -X PATCH "http://localhost:3000/v1/consumer/orders/${order.id}/payment-complete" \\`,
  );
  console.log(`    -H "Authorization: Bearer <액세스토큰>" -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"depositorName":"테스트입금자"}'`);
  console.log("");
  console.log(`확인: node ${path.relative(process.cwd(), __filename)} check ${order.id}`);
}

async function check(prisma, key) {
  const target = key ?? readBackup()?.id;
  if (!target) {
    console.error("주문번호나 주문ID를 지정하거나, 먼저 setup을 실행하세요.");
    process.exit(1);
  }

  const order = await findOrder(prisma, target);
  if (!order) {
    console.error(`주문을 찾을 수 없습니다: ${target}`);
    process.exit(1);
  }

  console.log(`주문 ${order.id} (${order.orderNumber})`);
  console.log(`  상태          : ${order.orderStatus}`);
  console.log(`  입금자명      : ${order.depositorName ?? "(없음)"}`);
  console.log(
    `  자동취소 표시 : ${
      order.paymentPendingExpiredAt
        ? new Date(order.paymentPendingExpiredAt).toLocaleString("ko-KR")
        : "(없음)"
    }`,
  );
  console.log("");

  const cancelled = order.orderStatus === "CANCEL_COMPLETED";
  console.log(`  [1] 입금자명 보존      : ${cancelled && order.depositorName ? "통과" : "미충족"}`);
  console.log(
    `  [2] 자동 취소 표시     : ${cancelled && order.paymentPendingExpiredAt ? "통과" : "미충족"}`,
  );
}

async function restore(prisma) {
  const backup = readBackup();
  if (!backup) {
    console.error(`백업 파일이 없습니다: ${BACKUP_PATH}`);
    process.exit(1);
  }

  await prisma.order.update({
    where: { id: backup.id },
    data: {
      orderStatus: backup.orderStatus,
      depositorName: backup.depositorName,
      paymentPendingAt: backup.paymentPendingAt ? new Date(backup.paymentPendingAt) : null,
      paymentPendingDeadlineAt: backup.paymentPendingDeadlineAt
        ? new Date(backup.paymentPendingDeadlineAt)
        : null,
      paymentPendingExpiredAt: backup.paymentPendingExpiredAt
        ? new Date(backup.paymentPendingExpiredAt)
        : null,
      adminRefundRevertReason: backup.adminRefundRevertReason,
      adminRefundRevertedAt: backup.adminRefundRevertedAt
        ? new Date(backup.adminRefundRevertedAt)
        : null,
    },
  });

  fs.unlinkSync(BACKUP_PATH);
  console.log(`복구 완료 — 주문 ${backup.id}를 ${backup.orderStatus} 상태로 되돌렸습니다.`);
}

function readBackup() {
  if (!fs.existsSync(BACKUP_PATH)) return null;
  return JSON.parse(fs.readFileSync(BACKUP_PATH, "utf8"));
}

(async () => {
  const [command, arg] = process.argv.slice(2);
  const prisma = new PrismaClient();
  try {
    switch (command) {
      case "setup":
        await setup(prisma, arg);
        break;
      case "check":
        await check(prisma, arg);
        break;
      case "restore":
        await restore(prisma);
        break;
      default:
        console.error("사용법: setup [주문ID] | check [주문ID] | restore");
        process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
})();
