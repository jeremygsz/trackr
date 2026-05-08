import React from 'react';
import { Transaction } from '@/types/transactions';
import { TransactionList } from '@/components/transactions/TransactionList/TransactionList';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onRefresh?: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, onRefresh }) => {
  return (
    <TransactionList 
      transactions={transactions} 
      onRefresh={onRefresh}
      title="Transactions Récentes"
      limit={5}
    />
  );
};
