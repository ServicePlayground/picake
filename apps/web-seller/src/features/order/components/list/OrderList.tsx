import { useNavigate, useParams } from "react-router-dom";
import { OrderResponseDto, OrderSortBy } from "@/apps/web-seller/features/order/types/order.dto";
import { ROUTES } from "@/apps/web-seller/common/constants/paths.constant";
import { EmptyState } from "@/apps/web-seller/common/components/fallbacks/EmptyState";
import { StatusBadge } from "@/apps/web-seller/common/components/badges/StatusBadge";
import {
  getOrderStatusBadgeVariant,
  getOrderStatusLabel,
} from "@/apps/web-seller/features/order/utils/order-status-ui.util";
import { cn } from "@/apps/web-seller/common/utils/classname.util";

interface OrderListProps {
  orders: OrderResponseDto[];
  sortBy: OrderSortBy;
  onSortChange: (sortBy: OrderSortBy) => void;
}

function SortIndicator({ active, asc }: { active: boolean; asc: boolean }) {
  return (
    <span
      className={cn(
        "ml-1 inline-block transition-colors",
        active ? "text-slate-800" : "text-slate-300",
      )}
    >
      {asc ? "↑" : "↓"}
    </span>
  );
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function OrderList({ orders, sortBy, onSortChange }: OrderListProps) {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();

  const handleOrderClick = (orderId: string) => {
    if (storeId) {
      navigate(ROUTES.STORE_DETAIL_ORDERS_DETAIL(storeId, orderId));
    }
  };

  const toggleDateSort = () => {
    onSortChange(sortBy === OrderSortBy.LATEST ? OrderSortBy.OLDEST : OrderSortBy.LATEST);
  };

  const togglePriceSort = () => {
    onSortChange(sortBy === OrderSortBy.PRICE_DESC ? OrderSortBy.PRICE_ASC : OrderSortBy.PRICE_DESC);
  };

  const dateSortActive = sortBy === OrderSortBy.LATEST || sortBy === OrderSortBy.OLDEST;
  const priceSortActive = sortBy === OrderSortBy.PRICE_DESC || sortBy === OrderSortBy.PRICE_ASC;

  if (orders.length === 0) {
    return <EmptyState message="주문이 없습니다." />;
  }

  const thBase =
    "px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 bg-slate-50 whitespace-nowrap";
  const tdBase = "px-3 py-3.5 border-b border-slate-100 text-[13px] text-slate-800";

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className={thBase}>주문번호</th>
              <th className={thBase}>상품명</th>
              <th className={thBase}>상태</th>
              <th className={thBase}>픽업 일시</th>
              <th
                className={cn(thBase, "cursor-pointer select-none hover:text-slate-800")}
                onClick={toggleDateSort}
              >
                주문일시
                <SortIndicator active={dateSortActive} asc={sortBy === OrderSortBy.OLDEST} />
              </th>
              <th
                className={cn(
                  thBase,
                  "cursor-pointer select-none text-right hover:text-slate-800",
                )}
                onClick={togglePriceSort}
              >
                금액
                <SortIndicator
                  active={priceSortActive}
                  asc={sortBy === OrderSortBy.PRICE_ASC}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => handleOrderClick(order.id)}
                className="cursor-pointer transition-colors hover:bg-slate-50 even:bg-slate-50/40"
              >
                <td className={cn(tdBase, "font-mono text-xs text-slate-500")}>
                  {order.orderNumber}
                </td>
                <td className={cn(tdBase, "max-w-[200px] truncate font-medium")}>
                  {order.productName}
                </td>
                <td className={tdBase}>
                  <StatusBadge variant={getOrderStatusBadgeVariant(order.orderStatus)}>
                    {getOrderStatusLabel(order.orderStatus)}
                  </StatusBadge>
                </td>
                <td className={cn(tdBase, "whitespace-nowrap")}>
                  {formatDate(order.pickupDate)}
                </td>
                <td className={cn(tdBase, "whitespace-nowrap text-slate-500")}>
                  {formatDate(order.createdAt)}
                </td>
                <td className={cn(tdBase, "whitespace-nowrap text-right font-semibold tabular-nums")}>
                  {order.totalPrice.toLocaleString()}원
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
