'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import styles from './Button.module.scss';

type ButtonBaseProps = Omit<HTMLMotionProps<'button'>, 'ref'>;

interface ButtonProps extends ButtonBaseProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading,
  fullWidth,
  className = '',
  ...props
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`
        ${styles.button} 
        ${styles[variant]} 
        ${fullWidth ? styles.fullWidth : ''} 
        ${className}
      `}
      disabled={isLoading || props.disabled}
      {...props}
    >
      <span className={styles.content}>
        {isLoading ? (
          <div className={styles.loader} aria-label="Chargement..." />
        ) : (
          children
        )}
      </span>
    </motion.button>
  );
};
