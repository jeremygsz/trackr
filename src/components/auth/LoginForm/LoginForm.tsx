'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input/Input';
import { Button } from '@/components/ui/button/Button';
import styles from './LoginForm.module.scss';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Identifiants invalides');
      setIsLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputs}>
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="votre@email.com"
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
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <Button type="submit" isLoading={isLoading} fullWidth>
        Se connecter
      </Button>

      <p className={styles.footer}>
        Pas encore de compte ? <a href="/register">S'inscrire</a>
      </p>
    </form>
  );
};
