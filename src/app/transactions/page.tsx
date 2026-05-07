'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.scss';
import { Navbar } from '@/components/ui/navbar/Navbar';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions/RecentTransactions';
import { Search, Filter, ArrowLeft, Download, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input/Input';
import { Button } from '@/components/ui/button/Button';
import Link from 'next/link';
import { Modal } from '@/components/ui/modal/Modal';
import { TransactionForm } from '@/components/forms/TransactionForm';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(t => 
    t.label.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar onNewTransaction={() => setIsModalOpen(true)} />
      
      <main className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <Link href="/dashboard" className={styles.backLink}>
              <ArrowLeft size={18} /> Retour
            </Link>
            <h1>Toutes les transactions</h1>
          </div>
          <div className={styles.actions}>
            <Button variant="outline" icon={<Download size={16} />}>Exporter</Button>
            <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={16} />}>Nouvelle</Button>
          </div>
        </header>

        <div className={styles.filtersBar}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Rechercher une transaction..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filterActions}>
            <Button variant="secondary" icon={<Calendar size={16} />}>Période</Button>
            <Button variant="secondary" icon={<Filter size={16} />}>Filtres</Button>
          </div>
        </div>

        <section className={styles.content}>
          {loading ? (
            <div className={styles.loader}>Chargement...</div>
          ) : (
            <RecentTransactions 
              transactions={filteredTransactions} 
              onRefresh={fetchTransactions}
            />
          )}
        </section>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajouter une transaction">
          <TransactionForm onSuccess={() => {
            setIsModalOpen(false);
            fetchTransactions();
          }} />
        </Modal>
      </main>
    </>
  );
}

const Plus = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);
