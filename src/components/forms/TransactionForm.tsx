'use client';

import React, { useState } from 'react';
import styles from './TransactionForm.module.scss';
import { Input } from '@/components/ui/input/Input';
import { Button } from '@/components/ui/button/Button';

export const TransactionForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/spendings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: data.label,
          amount: parseFloat(data.amount as string),
          subcategoryId: data.subcategoryId,
          bankId: data.bankId,
        }),
      });

      if (res.ok) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Input name="label" label="Libellé" placeholder="Ex: Courses Carrefour" required />
      <Input name="amount" label="Montant (€)" type="number" step="0.01" required />
      
      {/* Simulation de selects pour la démo - à remplacer par de vrais composants Select plus tard */}
      <Input name="subcategoryId" label="ID Sous-catégorie (ex: ID)" placeholder="ID de la sous-catégorie" required />
      <Input name="bankId" label="ID Banque" placeholder="ID de la banque" required />
      
      <Button type="submit" isLoading={isLoading}>Enregistrer</Button>
    </form>
  );
};
