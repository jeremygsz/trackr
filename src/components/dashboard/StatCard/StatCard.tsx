import React from 'react';
import styles from './StatCard.module.scss';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'danger' | 'warning';
}

export const StatCard: React.FC<StatCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  trend,
  color = 'primary' 
}) => {
  return (
    <div className={`${styles.statCard} ${styles[color]}`}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <Icon size={24} />
        </div>
      </div>
      <div className={styles.content}>
        <span className={styles.label}>{label}</span>
        <h3 className={styles.value}>{value}</h3>
      </div>
      {trend && (
          <div className={`${styles.trend} ${trend.isPositive ? styles.positive : styles.negative}`}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </div>
      )}
    </div>
  );
};
