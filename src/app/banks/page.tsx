'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/navbar/Navbar';
import { Modal } from '@/components/ui/modal/Modal';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { Plus, Pencil, Trash2, Landmark, Wallet } from 'lucide-react';
import styles from './page.module.scss';

interface Bank {
  id: string;
  label: string;
  color: string | null;
  logo: string | null;
  userId: string | null;
}

const PRESET_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#1f2937'
];

export default function BanksPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    label: '',
    color: '#3b82f6',
    logo: ''
  });

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const res = await fetch('/api/banks');
      const data = await res.json();
      if (res.ok) setBanks(data);
    } catch (err) {
      console.error('Failed to fetch banks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBankModal = (bank: Bank | null = null) => {
    if (bank) {
      setEditingBank(bank);
      setFormData({
        label: bank.label,
        color: bank.color || '#3b82f6',
        logo: bank.logo || ''
      });
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
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setIsBankModalOpen(false);
        fetchBanks();
      } else {
        setError(data.error || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBank = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette banque ?')) return;

    try {
      const res = await fetch(`/api/banks/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        fetchBanks();
      } else {
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      alert('Erreur de connexion au serveur');
    }
  };

  return (
    <>
      <Navbar onNewTransaction={() => setIsTransModalOpen(true)} />
      
      <main className={styles.banksPage}>
        <header className={styles.header}>
          <div>
            <h1>Banques</h1>
            <p>Gérez vos comptes bancaires et moyens de paiement.</p>
          </div>
          <Button onClick={() => handleOpenBankModal()}>
            <Plus size={18} />
            Ajouter une banque
          </Button>
        </header>

        {loading ? (
          <div className={styles.loading}>Chargement des banques...</div>
        ) : banks.length > 0 ? (
          <div className={styles.grid}>
            {banks.map((bank) => (
              <div key={bank.id} className={styles.bankCard}>
                <div className={styles.bankInfo}>
                  <div 
                    className={styles.bankIcon}
                    style={{ backgroundColor: bank.color || '#3b82f6' }}
                  >
                    {bank.label.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.bankDetails}>
                    <h3>{bank.label}</h3>
                    <span>{bank.userId ? 'Personnel' : 'Système'}</span>
                  </div>
                </div>
                
                {bank.userId && (
                  <div className={styles.actions}>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleOpenBankModal(bank)}
                      title="Modifier"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      className={`${styles.actionBtn} ${styles.delete}`}
                      onClick={() => handleDeleteBank(bank.id)}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <Landmark size={48} />
            <p>Vous n'avez pas encore ajouté de banque.</p>
            <Button variant="secondary" onClick={() => handleOpenBankModal()}>
              Ajouter ma première banque
            </Button>
          </div>
        )}

        {/* Modal Transaction */}
        <Modal 
          isOpen={isTransModalOpen} 
          onClose={() => setIsTransModalOpen(false)} 
          title="Ajouter une transaction"
        >
          <TransactionForm onSuccess={() => setIsTransModalOpen(false)} />
        </Modal>

        {/* Modal Add/Edit Bank */}
        <Modal 
          isOpen={isBankModalOpen} 
          onClose={() => setIsBankModalOpen(false)} 
          title={editingBank ? 'Modifier la banque' : 'Ajouter une banque'}
        >
          <form onSubmit={handleSaveBank} className={styles.modalForm}>
            {error && <div className={styles.error}>{error}</div>}
            
            <Input 
              label="Nom de la banque"
              placeholder="Ex: Boursorama, Revolut, Espèces..."
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              required
              autoFocus
            />

            <Input 
              label="URL du Logo (optionnel)"
              placeholder="https://exemple.com/logo.png"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            />

            <div className={styles.colorPicker}>
              <label>Couleur</label>
              <div className={styles.colors}>
                {PRESET_COLORS.map((c) => (
                  <div 
                    key={c}
                    className={`${styles.colorOption} ${formData.color === c ? styles.active : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setFormData({ ...formData, color: c })}
                  />
                ))}
              </div>
            </div>

            <Button type="submit" isLoading={isSaving} fullWidth>
              {editingBank ? 'Mettre à jour' : 'Créer la banque'}
            </Button>
          </form>
        </Modal>
      </main>
    </>
  );
}
