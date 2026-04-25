'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/navbar/Navbar';
import { Modal } from '@/components/ui/modal/Modal';
import { Button } from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import { Select } from '@/components/ui/select/Select';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { Plus, Pencil, Trash2, LayoutGrid, ChevronRight } from 'lucide-react';
import styles from './page.module.scss';

interface Subcategory {
  id: string;
  label: string;
  color: string | null;
  icon: string | null;
  createdBy: string | null;
}

interface Category {
  id: string;
  label: string;
  color: string | null;
  icon: string | null;
  createdBy: string | null;
  subcategories: Subcategory[];
}

const PRESET_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#6366f1', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#1f2937'
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTransModalOpen, setIsTransModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: 'category' | 'subcategory', data: any } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    label: '',
    color: '#3b82f6',
    icon: '',
    type: 'category' as 'category' | 'subcategory',
    categoryId: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (res.ok) setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type: 'category' | 'subcategory', parentId: string = '', item: any = null) => {
    if (item) {
      setEditingItem({ type, data: item });
      setFormData({
        label: item.label,
        color: item.color || '#3b82f6',
        icon: item.icon || '',
        type,
        categoryId: parentId
      });
    } else {
      setEditingItem(null);
      setFormData({
        label: '',
        color: '#3b82f6',
        icon: '',
        type,
        categoryId: parentId
      });
    }
    setError(null);
    setIsCategoryModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const isEditing = !!editingItem;
    const type = formData.type;
    const url = isEditing 
      ? `/api/${type === 'category' ? 'categories' : 'subcategories'}/${editingItem.data.id}`
      : '/api/categories';

    try {
      const res = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setIsCategoryModalOpen(false);
        fetchCategories();
      } else {
        setError(data.error || 'Une erreur est survenue');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (type: 'category' | 'subcategory', id: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer cette ${type === 'category' ? 'catégorie' : 'sous-catégorie'} ?`)) return;

    try {
      const url = `/api/${type === 'category' ? 'categories' : 'subcategories'}/${id}`;
      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        fetchCategories();
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
      
      <main className={styles.categoriesPage}>
        <header className={styles.header}>
          <div>
            <h1>Catégories</h1>
            <p>Organisez vos transactions avec des catégories et sous-catégories.</p>
          </div>
          <Button onClick={() => handleOpenModal('category')}>
            <Plus size={18} />
            Nouvelle catégorie
          </Button>
        </header>

        {loading ? (
          <div className={styles.loading}>Chargement des catégories...</div>
        ) : (
          <div className={styles.content}>
            {categories.map((cat) => (
              <div key={cat.id} className={styles.categoryGroup}>
                <div className={styles.categoryHeader}>
                  <div className={styles.categoryMainInfo}>
                    <div 
                      className={styles.categoryIcon}
                      style={{ backgroundColor: cat.color || '#3b82f6' }}
                    >
                      {cat.label.charAt(0).toUpperCase()}
                    </div>
                    <h2>{cat.label}</h2>
                  </div>
                  
                  <div className={styles.actions}>
                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal('subcategory', cat.id)}>
                      <Plus size={16} />
                      Sous-catégorie
                    </Button>
                    {cat.createdBy && (
                      <>
                        <button className={styles.actionBtn} onClick={() => handleOpenModal('category', '', cat)}>
                          <Pencil size={16} />
                        </button>
                        <button className={`${styles.actionBtn} ${styles.delete}`} onClick={() => handleDelete('category', cat.id)}>
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className={styles.subcategoriesList}>
                  {cat.subcategories.map((sub) => (
                    <div key={sub.id} className={styles.subcategoryCard}>
                      <div className={styles.subcategoryInfo}>
                        <div 
                          className={styles.subcategoryIcon}
                          style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: sub.color || cat.color || '#3b82f6' }}
                        />
                        <span>{sub.label}</span>
                      </div>
                      
                      {sub.createdBy && (
                        <div className={styles.actions}>
                          <button className={styles.actionBtn} onClick={() => handleOpenModal('subcategory', cat.id, sub)}>
                            <Pencil size={14} />
                          </button>
                          <button className={`${styles.actionBtn} ${styles.delete}`} onClick={() => handleDelete('subcategory', sub.id)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {cat.subcategories.length === 0 && (
                    <div className={styles.emptySub}>Aucune sous-catégorie</div>
                  )}
                </div>
              </div>
            ))}
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
          isOpen={isCategoryModalOpen} 
          onClose={() => setIsCategoryModalOpen(false)} 
          title={editingItem ? 'Modifier' : 'Ajouter'}
        >
          <form onSubmit={handleSave} className={styles.modalForm}>
            {error && <div className={styles.error}>{error}</div>}
            
            <Input 
              label="Libellé"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              required
              autoFocus
            />

            {!editingItem && !formData.categoryId && (
              <Select 
                label="Type"
                options={[
                  { value: 'category', label: 'Catégorie Principale' },
                  { value: 'subcategory', label: 'Sous-catégorie' }
                ]}
                value={formData.type}
                onChange={(val: any) => setFormData({ ...formData, type: val })}
              />
            )}

            {formData.type === 'subcategory' && !formData.categoryId && (
              <Select 
                label="Catégorie Parente"
                options={categories.map(c => ({ value: c.id, label: c.label }))}
                value={formData.categoryId}
                onChange={(val: any) => setFormData({ ...formData, categoryId: val })}
                required
              />
            )}

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
              Enregistrer
            </Button>
          </form>
        </Modal>
      </main>
    </>
  );
}
