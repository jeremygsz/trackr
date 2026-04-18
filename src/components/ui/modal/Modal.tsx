'use client';

import React from 'react';
import styles from './Modal.module.scss';
import { Button } from '@/components/ui/button/Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <Button variant="ghost" onClick={onClose}>×</Button>
        </div>
        {children}
      </div>
    </div>
  );
};
