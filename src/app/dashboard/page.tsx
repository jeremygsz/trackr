'use client';

import React, { useState } from 'react';
import styles from './page.module.scss';
import { Button } from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal/Modal';
import { TransactionForm } from '@/components/forms/TransactionForm';

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={styles.dashboard}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Mon Tableau de Bord</h1>
        <Button onClick={() => setIsModalOpen(true)}>+ Nouvelle transaction</Button>
      </header>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajouter une transaction">
        <TransactionForm onSuccess={() => setIsModalOpen(false)} />
      </Modal>

      <div className={styles.statsGrid}>
        <div className={styles.chartContainer}>Total Dépenses</div>
        <div className={styles.chartContainer}>Budget restant</div>
      </div>
    </div>
  );
}
