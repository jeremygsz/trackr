'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button/Button';
import { Check, LogOut } from 'lucide-react';
import styles from './page.module.scss';

interface Bank {
  id: string;
  label: string;
  color: string | null;
  logo: string | null;
}

export default function BanksOnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSystemBanks();
  }, []);

  const fetchSystemBanks = async () => {
    try {
      const res = await fetch('/api/banks/system');
      if (res.ok) {
        const data = await res.json();
        setBanks(data);
      }
    } catch (err) {
      console.error('Failed to fetch system banks:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBank = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (selectedIds.length === 0) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedBankIds: selectedIds }),
      });

      if (res.ok) {
        // Update session to reflect onboarding completion
        await update({ onboardingCompleted: true });
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Failed to save onboarding:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.onboardingPage}>
        <div className={styles.loading}>Chargement des banques...</div>
      </div>
    );
  }

  return (
    <div className={styles.onboardingPage}>
      <div className={styles.card}>
        <div className={styles.topActions}>
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })} 
            className={styles.logoutButton}
          >
            <LogOut size={16} />
            Se déconnecter
          </button>
        </div>

        <header className={styles.header}>
          <h1>Bienvenue sur Trackr !</h1>
          <p>Pour commencer, sélectionnez les banques et moyens de paiement que vous utilisez.</p>
        </header>

        <div className={styles.grid}>
          {banks.map((bank) => {
            const isSelected = selectedIds.includes(bank.id);
            return (
              <div 
                key={bank.id} 
                className={`${styles.bankItem} ${isSelected ? styles.selected : ''}`}
                onClick={() => toggleBank(bank.id)}
              >
                <div 
                  className={styles.bankIcon}
                >
                  {bank.logo && (bank.logo.startsWith('http') || bank.logo.includes('.') || bank.logo.includes('/')) ? (
                    <Image 
                      src={bank.logo.startsWith('http') ? bank.logo : (bank.logo.startsWith('/') ? bank.logo : `/${bank.logo}`)} 
                      alt={bank.label} 
                      fill 
                      unoptimized
                      className={styles.logoImg} 
                    />
                  ) : (
                    bank.label.charAt(0).toUpperCase()
                  )}
                  {isSelected && (
                    <div className={styles.checkOverlay}>
                      <Check size={24} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <span className={styles.bankLabel}>{bank.label}</span>
              </div>
            );
          })}
        </div>

        <footer className={styles.footer}>
          <span className={styles.selectionCount}>
            {selectedIds.length} banque{selectedIds.length > 1 ? 's' : ''} sélectionnée{selectedIds.length > 1 ? 's' : ''}
          </span>
          <Button 
            onClick={handleContinue} 
            disabled={selectedIds.length === 0} 
            isLoading={saving}
            fullWidth
          >
            Terminer la configuration
          </Button>
        </footer>
      </div>
    </div>
  );
}
