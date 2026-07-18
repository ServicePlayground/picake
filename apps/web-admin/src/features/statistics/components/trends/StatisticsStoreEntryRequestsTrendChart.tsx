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

interface StatisticsStoreEntryRequestsTrendChartProps {
  data: StatisticsTrendChartDatum[];
  height?: number;
}

/** 일별 입점 요청 라인 차트 */
export const StatisticsStoreEntryRequestsTrendChart: React.FC<
  StatisticsStoreEntryRequestsTrendChartProps
> = ({ data, height = 260 }) => {
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
          dataKey="storeEntryRequests"
          name="입점 요청"
          stroke="#06b6d4"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
