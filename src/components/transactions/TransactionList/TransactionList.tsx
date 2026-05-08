import React, { useState } from 'react';
import styles from './TransactionList.module.scss';
import { ShoppingBag, CreditCard, RefreshCw, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Modal } from '@/components/ui/modal/Modal';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { Transaction } from '@/types/transactions';

interface TransactionListProps {
  transactions: Transaction[];
  onRefresh?: () => void;
  title?: string;
  limit?: number;
  itemsPerPage?: number;
}

export const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  onRefresh, 
  title,
  limit,
  itemsPerPage 
}) => {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Apply limit if provided (e.g., for dashboard)
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  // Pagination logic
  const totalPages = itemsPerPage ? Math.ceil(displayTransactions.length / itemsPerPage) : 1;
  const startIndex = itemsPerPage ? (currentPage - 1) * itemsPerPage : 0;
  const paginatedTransactions = itemsPerPage 
    ? displayTransactions.slice(startIndex, startIndex + itemsPerPage) 
    : displayTransactions;

  const getIcon = (type: string) => {
    switch (type) {
      case 'subscription': return <RefreshCw size={18} />;
      case 'installment': return <CreditCard size={18} />;
      default: return <ShoppingBag size={18} />;
    }
  };

  return (
    <div className={styles.transactionList}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.list}>
        {paginatedTransactions.map((t) => (
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
        {paginatedTransactions.length === 0 && (
          <div className={styles.empty}>Aucune transaction trouvée</div>
        )}
      </div>

      {itemsPerPage && totalPages > 1 && (
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
              bankId: editingTransaction.bankId || editingTransaction.lines?.[0]?.bankId,
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
