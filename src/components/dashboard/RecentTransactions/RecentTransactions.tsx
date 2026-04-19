import React from 'react';
import styles from './RecentTransactions.module.scss';
import { ShoppingBag, CreditCard, RefreshCw } from 'lucide-react';

interface Transaction {
  id: string;
  label: string;
  amount: number;
  date: string;
  category: string;
  type: 'spending' | 'subscription' | 'installment';
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'subscription': return <RefreshCw size={18} />;
      case 'installment': return <CreditCard size={18} />;
      default: return <ShoppingBag size={18} />;
    }
  };

  return (
    <div className={styles.recentTransactions}>
      <h3 className={styles.title}>Transactions Récentes</h3>
      <div className={styles.list}>
        {transactions.map((t) => (
          <div key={t.id} className={styles.item}>
            <div className={`${styles.iconWrapper} ${styles[t.type]}`}>
              {getIcon(t.type)}
            </div>
            <div className={styles.info}>
              <span className={styles.label}>{t.label}</span>
              <span className={styles.meta}>{t.category} • {new Date(t.date).toLocaleDateString()}</span>
            </div>
            <div className={styles.amount}>
              -{t.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
