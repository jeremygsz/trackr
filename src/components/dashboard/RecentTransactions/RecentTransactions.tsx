import React, { useState } from 'react';
import styles from './RecentTransactions.module.scss';
import { ShoppingBag, CreditCard, RefreshCw, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from '@/components/ui/modal/Modal';
import { TransactionForm } from '@/components/forms/TransactionForm';

interface Transaction {
  id: string;
  label: string;
  amount: number;
  date: string;
  category: string;
  subcategoryId: string;
  storeId?: string;
  bankId?: string;
  notes?: string;
  type: 'spending' | 'subscription' | 'installment';
  lines?: any[];
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  onRefresh?: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, onRefresh }) => {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, startIndex + itemsPerPage);

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
        {currentTransactions.map((t) => (
          <div key={`${t.type}-${t.id}`} className={styles.item} onClick={() => setEditingTransaction(t)}>
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
            <div className={styles.editHint}>
              <Edit2 size={14} />
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => p - 1)}
            className={styles.pageBtn}
          >
            <ChevronLeft size={16} />
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage} sur {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(p => p + 1)}
            className={styles.pageBtn}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <Modal 
        isOpen={!!editingTransaction} 
        onClose={() => setEditingTransaction(null)} 
        title="Modifier la transaction"
      >
        {editingTransaction && (
          <TransactionForm 
            initialData={{
              ...editingTransaction,
              // Map bankId if not present (spendings have it on lines)
              bankId: editingTransaction.bankId || editingTransaction.lines?.[0]?.bankId,
              // Map lines for form
              lines: editingTransaction.lines?.map(l => ({
                amount: l.amountNet || l.amount,
                bankId: l.bankId,
                label: l.label
              }))
            }}
            onSuccess={() => {
              setEditingTransaction(null);
              onRefresh?.();
            }}
          />
        )}
      </Modal>
    </div>
  );
};
