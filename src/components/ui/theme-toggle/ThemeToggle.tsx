'use client';

import React from 'react';
import { useTheme } from '@/lib/theme-context';
import { Moon, Sun, Monitor } from 'lucide-react';
import styles from './ThemeToggle.module.scss';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className={styles.toggleGroup}>
      <button 
        className={`${styles.btn} ${theme === 'light' ? styles.active : ''}`}
        onClick={() => setTheme('light')}
        title="Mode clair"
      >
        <Sun size={16} />
      </button>
      <button 
        className={`${styles.btn} ${theme === 'system' ? styles.active : ''}`}
        onClick={() => setTheme('system')}
        title="Système"
      >
        <Monitor size={16} />
      </button>
      <button 
        className={`${styles.btn} ${theme === 'dark' ? styles.active : ''}`}
        onClick={() => setTheme('dark')}
        title="Mode sombre"
      >
        <Moon size={16} />
      </button>
    </div>
  );
};
