'use client';

import React from 'react';
import styles from './DashboardChart.module.scss';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useTheme } from '@/lib/theme-context';

interface DashboardChartProps {
  title: string;
  data: any[];
  dataKey: string;
  categoryKey: string;
  color?: string;
}

export const DashboardChart: React.FC<DashboardChartProps> = ({
  title,
  data,
  dataKey,
  categoryKey,
  color = '#3b82f6'
}) => {
  const { resolvedTheme } = useTheme();
  
  const gridColor = resolvedTheme === 'dark' ? '#1e293b' : '#e2e8f0';
  const textColor = resolvedTheme === 'dark' ? '#94a3b8' : '#64748b';
  const tooltipBg = resolvedTheme === 'dark' ? '#0f172a' : '#ffffff';
  const tooltipBorder = resolvedTheme === 'dark' ? '#334155' : '#e2e8f0';

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis 
              dataKey={categoryKey} 
              axisLine={false}
              tickLine={false}
              tick={{ fill: textColor, fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: textColor, fontSize: 12 }}
              tickFormatter={(value) => `${value}€`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: tooltipBg, 
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '8px',
                color: resolvedTheme === 'dark' ? '#f8fafc' : '#0f172a'
              }}
              itemStyle={{ color: color }}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              fillOpacity={1} 
              fill="url(#colorValue)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
