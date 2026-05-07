'use client';

import React, { useState, useEffect } from 'react';
import styles from './TransactionForm.module.scss';
import { Input } from '@/components/ui/input/Input';
import { Button } from '@/components/ui/button/Button';
import { Select } from '@/components/ui/select/Select';
import { Tag, Euro, LayoutGrid, CreditCard, FileText, Calendar, RefreshCw, Layers, Plus, Store as StoreIcon, X, ChevronRight, TrendingUp, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type TransactionType = 'spending' | 'installment' | 'subscription' | 'income';
type QuickAddType = 'banks' | 'stores' | 'categories' | null;
type DiscountType = 'amount' | 'percent';

interface MetaData {
  categories: any[];
  banks: any[];
  stores: any[];
}

export const TransactionForm: React.FC<{ 
  onSuccess?: () => void, 
  initialData?: any 
}> = ({ onSuccess, initialData }) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'spending');
  const [isLoading, setIsLoading] = useState(false);
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Multi-line state for spendings
  const [lines, setLines] = useState<any[]>(initialData?.lines?.map((l: any) => ({
    amountGross: l.amountGross || l.amountNet || l.amount || '',
    discount: l.discount || 0,
    discountType: 'amount' as DiscountType,
    showDiscount: !!l.discount && Number(l.discount) > 0,
    bankId: l.bankId || '',
    label: l.label || ''
  })) || [{
    amountGross: '',
    discount: 0,
    discountType: 'amount',
    showDiscount: false,
    bankId: '',
    label: ''
  }]);

  // Quick Add State
  const [quickAdd, setQuickAdd] = useState<{ 
    type: QuickAddType; 
    value: string;
    parentId?: string;
    mode?: 'category' | 'subcategory' 
  }>({ type: null, value: '', mode: 'subcategory' });
  const [isQuickAdding, setIsQuickAdding] = useState(false);

  // Controlled states for searchable selects
  const [formState, setFormState] = useState({
    storeId: initialData?.storeId || '',
    bankId: initialData?.bankId || '',
    subcategoryId: initialData?.subcategoryId || '',
    recurrency: initialData?.recurrency || 'monthly'
  });

  const fetchMeta = async () => {
    try {
      const res = await fetch('/api/spendings/meta');
      if (res.ok) {
        const data = await res.json();
        setMetaData(data);
        // Si aucune banque n'est encore sélectionnée, on applique la banque par défaut
        if (data.defaultBankId && !formState.bankId && !initialData) {
          setFormState(prev => ({ ...prev, bankId: data.defaultBankId }));
          setLines(prev => prev.map((l, i) => i === 0 ? { ...l, bankId: data.defaultBankId } : l));
        }
      }
    } catch (err) {
      console.error('Failed to fetch meta data', err);
    }
  };

  useEffect(() => {
    fetchMeta();
  }, []);

  const handleAddLine = () => {
    setLines([...lines, { 
      amountGross: '', 
      discount: 0, 
      discountType: 'amount', 
      showDiscount: false, 
      bankId: formState.bankId, 
      label: '' 
    }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const toggleDiscount = (index: number) => {
    const newLines = [...lines];
    newLines[index].showDiscount = !newLines[index].showDiscount;
    if (!newLines[index].showDiscount) {
      newLines[index].discount = 0;
    }
    setLines(newLines);
  };

  const handleQuickAddSubmit = async () => {
    if (!quickAdd.type || !quickAdd.value) return;
    if (quickAdd.type === 'categories' && quickAdd.mode === 'subcategory' && !quickAdd.parentId) {
      alert("Veuillez sélectionner une catégorie parente");
      return;
    }
    
    setIsQuickAdding(true);

    try {
      const endpoint = `/api/${quickAdd.type}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          label: quickAdd.value,
          parentId: quickAdd.mode === 'subcategory' ? quickAdd.parentId : undefined
        }),
      });

      if (res.ok) {
        const newItem = await res.json();
        await fetchMeta();
        
        // Auto-select the new item
        if (quickAdd.type === 'banks') setFormState(p => ({ ...p, bankId: newItem.id }));
        if (quickAdd.type === 'stores') setFormState(p => ({ ...p, storeId: newItem.id }));
        if (quickAdd.type === 'categories' && newItem.type === 'subcategory') {
          setFormState(p => ({ ...p, subcategoryId: newItem.id }));
        }
        
        setQuickAdd({ type: null, value: '', mode: 'subcategory' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsQuickAdding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(formData.entries());
    
    data.storeId = formState.storeId;
    data.bankId = formState.bankId;
    data.subcategoryId = formState.subcategoryId;
    data.recurrency = formState.recurrency;
    data.type = type;

    if (type === 'spending') {
      data.lines = lines.map(l => {
        const gross = parseFloat(l.amountGross) || 0;
        const discValue = parseFloat(l.discount) || 0;
        let discountAmount = discValue;
        
        if (l.discountType === 'percent') {
          discountAmount = (gross * discValue) / 100;
        }

        return {
          label: l.label || data.label,
          amountGross: gross,
          discount: discountAmount,
          amountNet: gross - discountAmount,
          bankId: l.bankId
        };
      });
      // Amount total is sum of net amounts
      data.amount = data.lines.reduce((acc: number, l: any) => acc + (l.amountNet || 0), 0);
    }

    try {
      let endpoint = '/api/spendings';
      if (type === 'subscription') endpoint = '/api/subscriptions';
      if (type === 'installment') endpoint = '/api/installments';
      if (type === 'income') endpoint = '/api/incomes';

      if (initialData?.id) {
        endpoint += `/${initialData.id}`;
      }

      const res = await fetch(endpoint, {
        method: initialData?.id ? 'PUT' : 'POST',
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

  const mainCategoryOptions = metaData?.categories.map(cat => ({
    value: cat.id,
    label: cat.label
  })) || [];

  const bankOptions = metaData?.banks.map(bank => ({
    value: bank.id,
    label: bank.label,
    logo: bank.logo,
    color: bank.color
  })) || [];

  const storeOptions = metaData?.stores.map(store => ({
    value: store.id,
    label: store.label
  })) || [];

  const types = [
    { id: 'spending', label: 'Ponctuelle', icon: Tag },
    { id: 'installment', label: 'Échéances', icon: Layers },
    { id: 'subscription', label: 'Abonnement', icon: RefreshCw },
    { id: 'income', label: 'Revenu', icon: TrendingUp },
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
          {/* Ligne 1: Libellé + Enseigne (si ce n'est pas un revenu) */}
          <div className={type === 'income' ? styles.fullWidth : styles.labelStoreGrid}>
            <Input 
              name="label" 
              label="Libellé" 
              placeholder={type === 'income' ? "Ex: Salaire, Vente Vinted..." : "Ex: Netflix, Courses..."} 
              required 
              defaultValue={initialData?.label}
              icon={<Tag size={16} />}
              error={errors.label}
              autoFocus
            />
            {type !== 'income' && (
              <div className={styles.withAction}>
                <Select 
                  label="Enseigne" 
                  options={storeOptions}
                  value={formState.storeId}
                  onChange={(val) => setFormState(prev => ({ ...prev, storeId: val }))}
                  icon={<StoreIcon size={16} />}
                  placeholder="Chercher..."
                />
                <button 
                  type="button" 
                  onClick={() => setQuickAdd({ type: 'stores', value: '' })} 
                  className={styles.quickAdd}
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
          
          {/* Ligne 2: Multi-lignes pour spending OU simple pour les autres */}
          {type === 'spending' ? (
            <div className={styles.fullWidth}>
              <div className={styles.dateRow}>
                <Input 
                  name="date" 
                  label="Date" 
                  type="date" 
                  defaultValue={initialData?.date || new Date().toISOString().split('T')[0]}
                  icon={<Calendar size={16} />}
                />
              </div>
              <div className={styles.linesContainer}>
                <div className={styles.linesHeader}>
                  <span>Lignes de dépense</span>
                </div>
                {lines.map((line, index) => (
                  <div key={index} className={styles.lineWrapper}>
                    <div className={styles.lineRow}>
                      <div className={styles.lineAmount}>
                        <Input 
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          value={line.amountGross}
                          onChange={(e) => handleLineChange(index, 'amountGross', e.target.value)}
                          icon={<Euro size={16} />}
                        />
                      </div>
                      <button 
                        type="button" 
                        className={`${styles.discountToggle} ${line.showDiscount ? styles.active : ''}`}
                        onClick={() => toggleDiscount(index)}
                        title="Ajouter une réduction"
                      >
                        <Percent size={14} />
                      </button>
                      <div className={styles.lineBank}>
                        <Select 
                          options={bankOptions}
                          value={line.bankId}
                          onChange={(val) => handleLineChange(index, 'bankId', val)}
                          placeholder="Compte"
                        />
                      </div>
                      <div className={styles.lineLabel}>
                        <Input 
                          placeholder="Libellé optionnel"
                          value={line.label}
                          onChange={(e) => handleLineChange(index, 'label', e.target.value)}
                        />
                      </div>
                      {lines.length > 1 && (
                        <button 
                          type="button" 
                          className={styles.removeLine} 
                          onClick={() => handleRemoveLine(index)}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    
                    <AnimatePresence>
                      {line.showDiscount && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={styles.discountRow}
                        >
                          <div className={styles.discountInputWrapper}>
                            <div className={styles.discountField}>
                              <Input 
                                placeholder="0.00"
                                type="number"
                                step="0.01"
                                value={line.discount}
                                onChange={(e) => handleLineChange(index, 'discount', e.target.value)}
                                label="Réduction"
                                icon={line.discountType === 'percent' ? <Percent size={14} /> : <Euro size={14} />}
                              />
                            </div>
                            <div className={styles.discountTypeToggle}>
                              <button 
                                type="button" 
                                className={line.discountType === 'amount' ? styles.active : ''}
                                onClick={() => handleLineChange(index, 'discountType', 'amount')}
                                title="Montant fixe"
                              >
                                €
                              </button>
                              <button 
                                type="button" 
                                className={line.discountType === 'percent' ? styles.active : ''}
                                onClick={() => handleLineChange(index, 'discountType', 'percent')}
                                title="Pourcentage"
                              >
                                %
                              </button>
                            </div>
                          </div>
                          <div className={styles.netPreview}>
                            <span>Montant Net</span>
                            <strong>
                              {(
                                (parseFloat(line.amountGross) || 0) - 
                                (line.discountType === 'percent' 
                                  ? ((parseFloat(line.amountGross) || 0) * (parseFloat(line.discount) || 0)) / 100
                                  : (parseFloat(line.discount) || 0))
                              ).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                            </strong>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
                <button type="button" className={styles.addLine} onClick={handleAddLine}>
                  <Plus size={14} /> Ajouter une ligne
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.threeCols}>
              <Input 
                name="amount" 
                label="Montant" 
                type="number" 
                step="0.01" 
                required 
                defaultValue={initialData?.amount}
                placeholder="0.00"
                icon={<Euro size={16} />}
                error={errors.amount}
              />

              <Input 
                name={type === 'income' ? 'date' : 'startAt'} 
                label={type === 'subscription' ? 'Prochain prél.' : type === 'installment' ? 'Date début' : 'Date'} 
                type="date" 
                defaultValue={initialData?.date || initialData?.startAt || new Date().toISOString().split('T')[0]}
                icon={<Calendar size={16} />}
              />

              <div className={styles.withAction}>
                <Select 
                  label={type === 'income' ? "Cible" : "Compte"} 
                  required 
                  options={bankOptions}
                  value={formState.bankId}
                  onChange={(val) => setFormState(prev => ({ ...prev, bankId: val }))}
                  icon={<CreditCard size={16} />}
                  error={errors.bankId}
                  placeholder="Chercher..."
                />
                <button 
                  type="button" 
                  onClick={() => setQuickAdd({ type: 'banks', value: '' })} 
                  className={styles.quickAdd}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Ligne 3: Catégorie */}
          <div className={styles.fullWidth}>
            <div className={styles.withAction}>
              <Select 
                label="Catégorie" 
                required 
                options={subcategoryOptions}
                value={formState.subcategoryId}
                onChange={(val) => setFormState(prev => ({ ...prev, subcategoryId: val }))}
                icon={<LayoutGrid size={16} />}
                error={errors.subcategoryId}
                placeholder="Chercher une catégorie..."
              />
              <button 
                type="button" 
                onClick={() => setQuickAdd({ type: 'categories', value: '', mode: 'subcategory' })} 
                className={styles.quickAdd}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {(type === 'subscription' || type === 'installment' || type === 'income') && (
              <motion.div 
                key={type}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={styles.fullWidth}
              >
                <div className={styles.twoCols}>
                  {type === 'subscription' || type === 'income' ? (
                    <Select 
                      label="Récurrence" 
                      options={[
                        { value: '', label: 'Ponctuel' },
                        { value: 'monthly', label: 'Mensuel' },
                        { value: 'yearly', label: 'Annuel' },
                        { value: 'weekly', label: 'Hebdomadaire' },
                      ]}
                      value={type === 'income' ? formState.recurrency : formState.recurrency || 'monthly'}
                      onChange={(val) => setFormState(prev => ({ ...prev, recurrency: val }))}
                      icon={<RefreshCw size={16} />}
                      placeholder={type === 'income' ? "Ponctuel" : "Choisir..."}
                    />
                  ) : (
                    <Input 
                      name="occurrences" 
                      label="Nombre d'échéances" 
                      type="number" 
                      defaultValue={initialData?.occurrences || "3"}
                      icon={<Layers size={16} />}
                    />
                  )}
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
              defaultValue={initialData?.notes}
              icon={<FileText size={16} />}
            />
          </div>
        </div>

        {errors.form && <p className={styles.formError}>{errors.form}</p>}
        
        <div className={styles.actions}>
          <Button type="submit" isLoading={isLoading} fullWidth>
            {type === 'income' ? 'Ajouter le revenu' : 'Enregistrer'}
          </Button>
        </div>
      </form>

      {/* QUICK ADD OVERLAY */}
      <AnimatePresence>
        {quickAdd.type && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.overlay}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={styles.overlayContent}
            >
              <div className={styles.overlayHeader}>
                <h3>Nouveau {quickAdd.type === 'banks' ? 'Compte' : quickAdd.type === 'stores' ? 'Enseigne' : 'Élément'}</h3>
                <button onClick={() => setQuickAdd({ type: null, value: '' })}><X size={18} /></button>
              </div>

              <div className={styles.overlayBody}>
                {quickAdd.type === 'categories' && (
                  <div className={styles.quickAddToggle}>
                    <button 
                      type="button" 
                      className={quickAdd.mode === 'subcategory' ? styles.active : ''}
                      onClick={() => setQuickAdd(p => ({ ...p, mode: 'subcategory' }))}
                    >
                      Sous-catégorie
                    </button>
                    <button 
                      type="button" 
                      className={quickAdd.mode === 'category' ? styles.active : ''}
                      onClick={() => setQuickAdd(p => ({ ...p, mode: 'category' }))}
                    >
                      Catégorie
                    </button>
                  </div>
                )}

                {quickAdd.type === 'categories' && quickAdd.mode === 'subcategory' && (
                  <Select 
                    label="Catégorie Parente"
                    options={mainCategoryOptions}
                    value={quickAdd.parentId}
                    onChange={(val) => setQuickAdd(p => ({ ...p, parentId: val }))}
                    placeholder="Choisir..."
                  />
                )}

                <Input 
                  autoFocus
                  label={quickAdd.type === 'categories' ? (quickAdd.mode === 'category' ? 'Nom de la catégorie' : 'Nom de la sous-catégorie') : 'Nom'}
                  placeholder="Ex: Salaire, Freelance..."
                  value={quickAdd.value}
                  onChange={(e) => setQuickAdd(p => ({ ...p, value: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickAddSubmit()}
                />

                <div className={styles.overlayActions}>
                  <Button variant="secondary" onClick={() => setQuickAdd({ type: null, value: '' })}>Annuler</Button>
                  <Button isLoading={isQuickAdding} onClick={handleQuickAddSubmit}>Ajouter</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
