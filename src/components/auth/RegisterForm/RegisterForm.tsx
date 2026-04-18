'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User as UserIcon, Ticket } from 'lucide-react';
import { Input } from '@/components/ui/input/Input';
import { Button } from '@/components/ui/button/Button';
import styles from './RegisterForm.module.scss';

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Une erreur est survenue lors de l'inscription");
      }

      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <Input
          id="firstname"
          name="firstname"
          label="Prénom"
          placeholder="Jean"
          required
          icon={<UserIcon size={18} />}
        />
        <Input
          id="lastname"
          name="lastname"
          label="Nom"
          placeholder="Dupont"
          required
        />
      </div>

      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="jean@exemple.com"
        required
        icon={<Mail size={18} />}
      />

      <Input
        id="password"
        name="password"
        type="password"
        label="Mot de passe"
        placeholder="••••••••"
        required
        icon={<Lock size={18} />}
      />

      <Input
        id="inviteCode"
        name="inviteCode"
        label="Code d'invitation"
        placeholder="CODE-123"
        required
        icon={<Ticket size={18} />}
      />

      {error && <p className={styles.error}>{error}</p>}

      <Button type="submit" isLoading={isLoading} fullWidth>
        Créer mon compte
      </Button>

      <p className={styles.footer}>
        Déjà un compte ? <a href="/login">Se connecter</a>
      </p>
    </form>
  );
};
