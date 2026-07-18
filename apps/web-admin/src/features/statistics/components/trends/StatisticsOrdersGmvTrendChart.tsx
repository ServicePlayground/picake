import React from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StatisticsTrendChartDatum } from "@/apps/web-admin/features/statistics/types/statistics-chart.type";

/** 차트 색상 (Tailwind 팔레트 고정값) */
const COLORS = {
  orders: "#a5b4fc", // indigo-300
  gmv: "#10b981", // emerald-500
} as const;

interface StatisticsOrdersGmvTrendChartProps {
  data: StatisticsTrendChartDatum[];
  height?: number;
}

/** 일별 주문 수(막대) + GMV(라인) 복합 차트 */
export const StatisticsOrdersGmvTrendChart: React.FC<StatisticsOrdersGmvTrendChartProps> = ({
  data,
  height = 260,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="dateLabel" fontSize={12} tickLine={false} />
        <YAxis yAxisId="orders" allowDecimals={false} fontSize={12} tickLine={false} width={40} />
        <YAxis
          yAxisId="gmv"
          orientation="right"
          fontSize={12}
          tickLine={false}
          width={72}
          tickFormatter={(value: number) => `${value.toLocaleString()}원`}
        />
        <Tooltip
          formatter={(value: number, name: string) =>
            name === "GMV" ? `${value.toLocaleString()}원` : `${value.toLocaleString()}건`
          }
        />
        <Legend />
        <Bar
          yAxisId="orders"
          dataKey="orderCount"
          name="주문 수"
          fill={COLORS.orders}
          radius={[4, 4, 0, 0]}
        />
        <Line
          yAxisId="gmv"
          type="monotone"
          dataKey="gmv"
          name="GMV"
          stroke={COLORS.gmv}
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
