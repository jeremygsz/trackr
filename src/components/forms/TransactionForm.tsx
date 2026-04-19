'use client';

import React, { useState, useEffect } from 'react';
import styles from './TransactionForm.module.scss';
import { Input } from '@/components/ui/input/Input';
import { Button } from '@/components/ui/button/Button';
import { Select } from '@/components/ui/select/Select';
import { Tag, Euro, LayoutGrid, CreditCard, FileText, Calendar, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TransactionType = 'spending' | 'installment' | 'subscription';

interface MetaData {
  categories: any[];
  banks: any[];
}

export const TransactionForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [type, setType] = useState<TransactionType>('spending');
  const [isLoading, setIsLoading] = useState(false);
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await fetch('/api/spendings/meta');
        if (res.ok) {
          const data = await res.json();
          setMetaData(data);
        }
      } catch (err) {
        console.error('Failed to fetch meta data', err);
      }
    };
    fetchMeta();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    data.type = type;

    try {
      let endpoint = '/api/spendings';
      if (type === 'subscription') endpoint = '/api/subscriptions';
      if (type === 'installment') endpoint = '/api/installments';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        onSuccess?.();
      } else {
        const errorData = await res.json();
        setErrors({ form: errorData.error || 'Une erreur est survenue' });
      }
    } catch (error) {
      setErrors({ form: 'Erreur de connexion' });
    } finally {
      setIsLoading(false);
    }
  };

  const subcategoryOptions = metaData?.categories.flatMap(cat => 
    cat.subcategories.map((sub: any) => ({
      value: sub.id,
      label: `${cat.label} > ${sub.label}`
    }))
  ) || [];

  const bankOptions = metaData?.banks.map(bank => ({
    value: bank.id,
    label: bank.label
  })) || [];

  const types = [
    { id: 'spending', label: 'Ponctuelle', icon: Tag },
    { id: 'installment', label: 'Plusieurs fois', icon: Layers },
    { id: 'subscription', label: 'Abonnement', icon: RefreshCw },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.typeSelector}>
        {types.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${styles.typeBtn} ${type === t.id ? styles.active : ''}`}
            onClick={() => setType(t.id as TransactionType)}
          >
            <t.icon size={16} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.compactGrid}>
          {/* Ligne 1: Libellé */}
          <div className={styles.fullWidth}>
            <Input 
              name="label" 
              label="Libellé" 
              placeholder="Ex: Netflix, Courses..." 
              required 
              icon={<Tag size={16} />}
              error={errors.label}
              autoFocus
            />
          </div>
          
          {/* Ligne 2: Montant + Date + Moyen de paiement */}
          <div className={styles.threeCols}>
            <Input 
              name="amount" 
              label="Montant" 
              type="number" 
              step="0.01" 
              required 
              placeholder="0.00"
              icon={<Euro size={16} />}
              error={errors.amount}
            />

            {/* Date dynamique selon le type */}
            <Input 
              name={type === 'spending' ? 'date' : 'startAt'} 
              label={type === 'subscription' ? 'Prochain prél.' : type === 'installment' ? 'Date début' : 'Date'} 
              type="date" 
              defaultValue={new Date().toISOString().split('T')[0]}
              icon={<Calendar size={16} />}
            />

            <Select 
              name="bankId" 
              label="Compte" 
              required 
              options={bankOptions}
              icon={<CreditCard size={16} />}
              error={errors.bankId}
            />
          </div>

          {/* Ligne 3: Catégorie */}
          <div className={styles.fullWidth}>
            <Select 
              name="subcategoryId" 
              label="Catégorie" 
              required 
              options={subcategoryOptions}
              icon={<LayoutGrid size={16} />}
              error={errors.subcategoryId}
            />
          </div>

          {/* Ligne 4: Options spécifiques (Récurrence ou Échéances) */}
          <AnimatePresence mode="wait">
            {(type === 'subscription' || type === 'installment') && (
              <motion.div 
                key={type}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={styles.fullWidth}
              >
                <div className={styles.twoCols}>
                  {type === 'subscription' ? (
                    <Select 
                      name="recurrency" 
                      label="Récurrence" 
                      options={[
                        { value: 'monthly', label: 'Mensuel' },
                        { value: 'yearly', label: 'Annuel' },
                        { value: 'weekly', label: 'Hebdomadaire' },
                      ]}
                      defaultValue="monthly"
                      icon={<RefreshCw size={16} />}
                    />
                  ) : (
                    <Input 
                      name="occurrences" 
                      label="Nombre d'échéances" 
                      type="number" 
                      defaultValue="3"
                      icon={<Layers size={16} />}
                    />
                  )}
                  {/* On laisse la deuxième colonne vide ou pour un futur champ si besoin, 
                      pour garder l'alignement propre */}
                  <div />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ligne 5: Notes */}
          <div className={styles.fullWidth}>
            <Input 
              name="notes" 
              label="Notes (optionnel)" 
              placeholder="Détails..." 
              icon={<FileText size={16} />}
            />
          </div>
        </div>

        {errors.form && <p className={styles.formError}>{errors.form}</p>}
        
        <div className={styles.actions}>
          <Button 
            type="submit" 
            isLoading={isLoading} 
            fullWidth
          >
            Enregistrer
          </Button>
        </div>
      </form>
    </div>
  );
};
