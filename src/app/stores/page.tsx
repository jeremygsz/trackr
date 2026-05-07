'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/ui/navbar/Navbar';
import { Modal } from '@/components/ui/modal/Modal';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { Plus, Pencil, Trash2, Store as StoreIcon, ExternalLink } from 'lucide-react';
import styles from './page.module.scss';

interface Store {
  id: string;
  label: string;
  logo: string | null;
  website: string | null;
  userId: string | null;
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    label: '',
    website: '',
    logo: ''
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await fetch('/api/stores');
      const data = await res.json();
      if (res.ok) setStores(data);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStoreModal = (store: Store | null = null) => {
    if (store) {
      setEditingStore(store);
      setFormData({
        label: store.label,
        website: store.website || '',
        logo: store.logo || ''
      });
    } else {
      setEditingStore(null);
      setFormData({ label: '', website: '', logo: '' });
    }
    setError(null);
    setIsStoreModalOpen(true);
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const method = editingStore ? 'PATCH' : 'POST';
    const url = editingStore ? `/api/stores/${editingStore.id}` : '/api/stores';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setIsStoreModalOpen(false);
        fetchStores();
      } else {
        setError(data.error || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStore = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce magasin ?')) return;

    try {
      const res = await fetch(`/api/stores/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        fetchStores();
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
      
      <main className={styles.storesPage}>
        <header className={styles.header}>
          <div>
            <h1>Magasins</h1>
            <p>Gérez vos enseignes et commerces habituels.</p>
          </div>
          <Button onClick={() => handleOpenStoreModal()}>
            <Plus size={18} />
            Ajouter un magasin
          </Button>
        </header>

        {loading ? (
          <div className={styles.loading}>Chargement des magasins...</div>
        ) : stores.length > 0 ? (
          <div className={styles.grid}>
            {stores.map((store) => (
              <div key={store.id} className={styles.storeCard}>
                <div className={styles.storeInfo}>
                  <div className={styles.storeIcon}>
                    {store.logo && (store.logo.includes('/') || store.logo.includes('.')) ? (
                      <Image 
                        src={store.logo} 
                        alt={store.label} 
                        fill 
                        className={styles.logoImg} 
                      />
                    ) : (
                      <StoreIcon size={24} />
                    )}
                  </div>
                  <div className={styles.storeDetails}>
                    <span className={styles.badge}>{store.userId ? 'Personnel' : 'Système'}</span>
                    <h3>{store.label}</h3>
                    {store.website && (
                      <a href={store.website.startsWith('http') ? store.website : `https://${store.website}`} target="_blank" rel="noopener noreferrer">
                        {store.website.replace(/^https?:\/\//, '')} <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
                
                {store.userId && (
                  <div className={styles.actions}>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => handleOpenStoreModal(store)}
                      title="Modifier"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      className={`${styles.actionBtn} ${styles.delete}`}
                      onClick={() => handleDeleteStore(store.id)}
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
            <StoreIcon size={48} />
            <p>Vous n'avez pas encore ajouté de magasin.</p>
            <Button variant="secondary" onClick={() => handleOpenStoreModal()}>
              Ajouter mon premier magasin
            </Button>
          </div>
        )}

        <Modal 
          isOpen={isTransModalOpen} 
          onClose={() => setIsTransModalOpen(false)} 
          title="Ajouter une transaction"
        >
          <TransactionForm onSuccess={() => setIsTransModalOpen(false)} />
        </Modal>

        <Modal 
          isOpen={isStoreModalOpen} 
          onClose={() => setIsStoreModalOpen(false)} 
          title={editingStore ? 'Modifier le magasin' : 'Ajouter un magasin'}
        >
          <form onSubmit={handleSaveStore} className={styles.modalForm}>
            {error && <div className={styles.error}>{error}</div>}
            
            <Input 
              label="Nom du magasin"
              placeholder="Ex: Amazon, Leclerc, Netflix..."
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              required
              autoFocus
            />

            <Input 
              label="Site web (optionnel)"
              placeholder="www.exemple.com"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            />

            <Input 
              label="URL du Logo (optionnel)"
              placeholder="https://exemple.com/logo.png"
              value={formData.logo}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
            />

            <Button type="submit" isLoading={isSaving} fullWidth>
              {editingStore ? 'Mettre à jour' : 'Créer le magasin'}
            </Button>
          </form>
        </Modal>
      </main>
    </>
  );
}
