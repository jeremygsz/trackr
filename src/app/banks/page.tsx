'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/ui/navbar/Navbar';
import { Modal } from '@/components/ui/modal/Modal';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { Plus, Pencil, Trash2, Landmark, Star, GripVertical, Save } from 'lucide-react';
import styles from './page.module.scss';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast, Toaster } from 'react-hot-toast';

interface Bank {
  id: string;
  label: string;
  color: string | null;
  logo: string | null;
  userId: string | null;
  selected?: boolean;
}

const PRESET_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#1f2937'
];

const SortableBankCard = ({ bank, onEdit, onDelete, onSetDefault }: { 
  bank: Bank; 
  onEdit: (b: Bank) => void; 
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: bank.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className={styles.bankCard}>
      <div className={styles.bankInfo}>
        <div {...attributes} {...listeners} className={styles.dragHandle}>
          <GripVertical size={20} />
        </div>
        <div 
          className={styles.bankIcon}
          style={{ backgroundColor: bank.logo ? 'white' : (bank.color || '#3b82f6') }}
        >
          {bank.logo ? (
            <Image src={bank.logo} alt={bank.label} fill unoptimized className={styles.logoImg} />
          ) : (
            bank.label.charAt(0).toUpperCase()
          )}
        </div>
        <div className={styles.bankDetails}>
          <div className={styles.bankTitleRow}>
            <h3>{bank.label}</h3>
            {bank.selected && <Star size={14} className={styles.defaultStar} fill="currentColor" />}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        {!bank.selected && (
          <button className={`${styles.actionBtn} ${styles.starBtn}`} onClick={() => onSetDefault(bank.id)} title="Par défaut">
            <Star size={16} />
          </button>
        )}
        {bank.userId && (
          <>
            <button className={styles.actionBtn} onClick={() => onEdit(bank)}><Pencil size={16} /></button>
            <button className={`${styles.actionBtn} ${styles.delete}`} onClick={() => onDelete(bank.id)}><Trash2 size={16} /></button>
          </>
        )}
      </div>
    </div>
  );
};

export default function BanksPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [initialBanks, setInitialBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({ label: '', color: '#3b82f6', logo: '' });

  useEffect(() => { fetchBanks(); }, []);

  const fetchBanks = async () => {
    try {
      const res = await fetch('/api/banks');
      const data = await res.json();
      if (res.ok) {
        setBanks(data);
        setInitialBanks(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBanks((items) => {
        const oldIndex = items.findIndex((b) => b.id === active.id);
        const newIndex = items.findIndex((b) => b.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const saveOrder = async () => {
    setIsSavingOrder(true);
    try {
      const res = await fetch('/api/banks/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankIds: banks.map(b => b.id) })
      });
      if (!res.ok) throw new Error();
      setInitialBanks(banks);
      toast.success('Ordre sauvegardé !');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleOpenBankModal = (bank: Bank | null = null) => {
    if (bank) {
      setEditingBank(bank);
      setFormData({ label: bank.label, color: bank.color || '#3b82f6', logo: bank.logo || '' });
    } else {
      setEditingBank(null);
      setFormData({ label: '', color: '#3b82f6', logo: '' });
    }
    setError(null);
    setIsBankModalOpen(true);
  };

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    const method = editingBank ? 'PATCH' : 'POST';
    const url = editingBank ? `/api/banks/${editingBank.id}` : '/api/banks';
    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData),
      });
      if (res.ok) { setIsBankModalOpen(false); fetchBanks(); }
      else { setError((await res.json()).error || 'Erreur'); }
    } finally { setIsSaving(false); }
  };

  const handleDeleteBank = async (id: string) => {
    if (!confirm('Supprimer cette banque ?')) return;
    const res = await fetch(`/api/banks/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Banque supprimée');
      fetchBanks();
    } else {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSetDefaultBank = async (bankId: string) => {
    await fetch('/api/user/banks/default', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bankId }),
    });
    fetchBanks();
  };

  const hasChanged = JSON.stringify(banks) !== JSON.stringify(initialBanks);

  return (
    <>
      <Toaster position="bottom-right" />
      <Navbar onNewTransaction={() => setIsTransModalOpen(true)} />
      <main className={styles.banksPage}>
        <header className={styles.header}>
          <div>
            <h1>Banques</h1>
            <p>Gérez vos comptes bancaires.</p>
          </div>
          <div>
            <Button onClick={() => handleOpenBankModal()}>
              <Plus size={18} /> Ajouter
            </Button>
          </div>
          <div className={styles.actionsHeader}>
            {hasChanged && (
                <Button onClick={saveOrder} isLoading={isSavingOrder} variant="success">
                  <Save size={18} /> Sauvegarder l'ordre
                </Button>
            )}
          </div>
        </header>

        {loading ? (
          <div className={styles.loading}>Chargement...</div>
        ) : banks.length > 0 ? (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={banks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              <div className={styles.list}>
                {banks.map((bank) => (
                  <SortableBankCard 
                    key={bank.id} 
                    bank={bank} 
                    onEdit={handleOpenBankModal} 
                    onDelete={handleDeleteBank}
                    onSetDefault={handleSetDefaultBank}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className={styles.empty}>
            <Landmark size={48} />
            <p>Aucune banque ajoutée.</p>
            <Button variant="secondary" onClick={() => handleOpenBankModal()}>Ajouter ma première banque</Button>
          </div>
        )}

        <Modal isOpen={isTransModalOpen} onClose={() => setIsTransModalOpen(false)} title="Ajouter une transaction">
          <TransactionForm onSuccess={() => setIsTransModalOpen(false)} />
        </Modal>

        <Modal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} title={editingBank ? 'Modifier' : 'Ajouter'}>
          <form onSubmit={handleSaveBank} className={styles.modalForm}>
            {error && <div className={styles.error}>{error}</div>}
            <Input label="Nom" value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} required autoFocus />
            <div className={styles.colorPicker}>
              <label>Couleur</label>
              <div className={styles.colors}>
                {PRESET_COLORS.map((c) => (
                  <div key={c} className={`${styles.colorOption} ${formData.color === c ? styles.active : ''}`} style={{ backgroundColor: c }} onClick={() => setFormData({ ...formData, color: c })} />
                ))}
              </div>
            </div>
            <Button type="submit" isLoading={isSaving} fullWidth>Enregistrer</Button>
          </form>
        </Modal>
      </main>
    </>
  );
}
