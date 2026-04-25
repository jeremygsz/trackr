'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/ui/navbar/Navbar';
import { Input } from '@/components/ui/input/Input';
import { Select } from '@/components/ui/select/Select';
import { Button } from '@/components/ui/button/Button';
import { User, Lock, Globe, Save } from 'lucide-react';
import styles from './page.module.scss';

import { Modal } from '@/components/ui/modal/Modal';
import { TransactionForm } from '@/components/forms/TransactionForm';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    currency: 'EUR',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({
          ...prev,
          firstname: data.firstname || '',
          lastname: data.lastname || '',
          email: data.email || '',
          currency: data.currency || 'EUR',
        }));
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas.' });
      setSaving(false);
      return;
    }

    try {
      const { confirmPassword, ...submitData } = formData;
      
      // Only send password fields if user is trying to change password
      if (!submitData.newPassword) {
        delete (submitData as any).currentPassword;
        delete (submitData as any).newPassword;
      }

      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès.' });
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        setMessage({ type: 'error', text: data.error || 'Une erreur est survenue.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Une erreur est survenue lors de la connexion au serveur.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar onNewTransaction={() => setIsModalOpen(true)} />
        <div className={styles.loading}>Chargement de votre profil...</div>
      </>
    );
  }

  return (
    <>
      <Navbar onNewTransaction={() => setIsModalOpen(true)} />
      
      <main className={styles.profilePage}>
        <header className={styles.header}>
          <h1>Mon Profil</h1>
          <p>Gérez vos informations personnelles et vos préférences.</p>
        </header>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajouter une transaction">
          <TransactionForm onSuccess={() => setIsModalOpen(false)} />
        </Modal>

        <form onSubmit={handleSubmit}>
          <section className={styles.section}>
            <h2><User size={20} /> Informations personnelles</h2>
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label>Prénom</label>
                <Input 
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  placeholder="Votre prénom"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Nom</label>
                <Input 
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  placeholder="Votre nom"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <Input 
                  value={formData.email}
                  disabled
                  readOnly
                  className={styles.readOnlyInput}
                />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2><Globe size={20} /> Préférences</h2>
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label>Devise par défaut</label>
                <Select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  options={[
                    { value: 'EUR', label: 'Euro (€)' },
                    { value: 'USD', label: 'Dollar ($)' },
                    { value: 'GBP', label: 'Livre (£)' },
                    { value: 'CHF', label: 'Franc Suisse (CHF)' },
                  ]}
                />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2><Lock size={20} /> Sécurité</h2>
            <div className={styles.grid}>
              <div className={styles.formGroup}>
                <label>Mot de passe actuel</label>
                <Input 
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
              <div /> {/* Spacer */}
              <div className={styles.formGroup}>
                <label>Nouveau mot de passe</label>
                <Input 
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Confirmer le nouveau mot de passe</label>
                <Input 
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </section>

          <footer className={styles.footer}>
            <Button 
              type="submit" 
              isLoading={saving}
              className={styles.saveBtn}
            >
              <Save size={18} />
              Enregistrer les modifications
            </Button>
          </footer>
        </form>
      </main>
    </>
  );
}
