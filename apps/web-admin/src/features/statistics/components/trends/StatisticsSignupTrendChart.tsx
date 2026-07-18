import React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { StatisticsTrendChartDatum } from "@/apps/web-admin/features/statistics/types/statistics-chart.type";

/** 차트 색상 (Tailwind 팔레트 고정값) */
const COLORS = {
  consumers: "#3b82f6", // blue-500
  sellers: "#f97316", // orange-500
} as const;

interface StatisticsSignupTrendChartProps {
  data: StatisticsTrendChartDatum[];
  height?: number;
}

/** 일별 신규 가입(구매자·판매자) 라인 차트 */
export const StatisticsSignupTrendChart: React.FC<StatisticsSignupTrendChartProps> = ({
  data,
  height = 260,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="dateLabel" fontSize={12} tickLine={false} />
        <YAxis allowDecimals={false} fontSize={12} tickLine={false} width={40} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="newConsumers"
          name="구매자"
          stroke={COLORS.consumers}
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="newSellers"
          name="판매자"
          stroke={COLORS.sellers}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
