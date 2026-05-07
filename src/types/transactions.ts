export interface Transaction {
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
