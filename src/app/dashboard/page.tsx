'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.scss';
import { Modal } from '@/components/ui/modal/Modal';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import { DashboardChart } from '@/components/dashboard/DashboardChart/DashboardChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions/RecentTransactions';
import { Wallet, TrendingDown, Calendar, ArrowRight, Clock, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { Navbar } from '@/components/ui/navbar/Navbar';
import Link from 'next/link';

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
    <>
      <Navbar onNewTransaction={() => setIsModalOpen(true)} />
      
      <main className={styles.dashboard}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <h1>Tableau de bord</h1>
            <p>Bienvenue, voici un aperçu de vos finances.</p>
          </div>
        </header>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajouter une transaction">
          <TransactionForm onSuccess={() => {
            setIsModalOpen(false);
            fetchDashboardData();
          }} />
        </Modal>

        <div className={styles.statsGrid}>
          <StatCard 
            label="Aujourd'hui" 
            value={`${data?.stats?.dailySpending.toLocaleString()}€`} 
            icon={Clock}
            color="primary"
          />
          <StatCard 
            label="Cette semaine" 
            value={`${data?.stats?.weeklySpending.toLocaleString()}€`} 
            icon={CalendarDays}
            color="warning"
          />
          <StatCard 
            label="Ce mois" 
            value={`${data?.stats?.totalSpending.toLocaleString()}€`} 
            icon={TrendingDown}
            trend={{ value: data?.stats?.spendingTrend || 0, isPositive: (data?.stats?.spendingTrend || 0) < 0 }}
            color="danger"
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
            <RecentTransactions 
              transactions={data?.transactions || []} 
              onRefresh={fetchDashboardData}
            />
            <Link href="/transactions" className={styles.viewAllWrapper}>
              <Button variant="ghost" className={styles.viewAll}>
                Voir tout <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
