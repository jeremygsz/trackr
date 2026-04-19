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
  color = '#2563eb'
}) => {
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
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#252540" />
            <XAxis 
              dataKey={categoryKey} 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#475569', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#475569', fontSize: 12 }}
              tickFormatter={(value) => `${value}€`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#12121e', 
                border: '1px solid #252540',
                borderRadius: '8px',
                color: '#f8fafc'
              }}
              itemStyle={{ color: '#2563eb' }}
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
