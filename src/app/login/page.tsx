import React from 'react';
import { AuthCard } from '@/components/auth/AuthCard/AuthCard';
import { LoginForm } from '@/components/auth/LoginForm/LoginForm';
import styles from './page.module.scss';

export default function LoginPage() {
  return (
    <main className={styles.main}>
      <div className={styles.background}>
        <div className={styles.circle1} />
        <div className={styles.circle2} />
      </div>
      
      <AuthCard 
        title="Ravi de vous revoir" 
        subtitle="Connectez-vous pour gérer vos finances"
      >
        <LoginForm />
      </AuthCard>
    </main>
  );
}
