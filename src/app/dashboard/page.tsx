'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.scss';
import { Button } from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal/Modal';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import { DashboardChart } from '@/components/dashboard/DashboardChart/DashboardChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions/RecentTransactions';
import { Wallet, TrendingDown, Calendar, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Chargement...</div>;

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <h1>Mon Tableau de Bord</h1>
          <p>Bienvenue, voici un aperçu de vos finances.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>+ Nouvelle transaction</Button>
      </header>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajouter une transaction">
        <TransactionForm onSuccess={() => {
          setIsModalOpen(false);
          fetchDashboardData();
        }} />
      </Modal>

      <div className={styles.statsGrid}>
        <StatCard 
          label="Dépenses ce mois" 
          value={`${data?.stats?.totalSpending.toLocaleString()}€`} 
          icon={TrendingDown}
          trend={{ value: data?.stats?.spendingTrend || 0, isPositive: (data?.stats?.spendingTrend || 0) < 0 }}
          color="danger"
        />
        <StatCard 
          label="Abonnements" 
          value={`${data?.stats?.activeSubscriptions.toLocaleString()}€`} 
          icon={Calendar}
          color="warning"
        />
        <StatCard 
          label="Budget restant" 
          value={`${data?.stats?.budgetRemaining.toLocaleString()}€`} 
          icon={Wallet}
          color="success"
        />
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.leftCol}>
          <DashboardChart 
            title="Aperçu des dépenses (7 derniers jours)" 
            data={data?.chartData || []}
            dataKey="total"
            categoryKey="name"
          />
        </div>
        <div className={styles.rightCol}>
          <RecentTransactions transactions={data?.transactions || []} />
          <Button variant="ghost" className={styles.viewAll}>
            Voir tout <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
