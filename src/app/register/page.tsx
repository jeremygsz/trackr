import React from 'react';
import { AuthCard } from '@/components/auth/AuthCard/AuthCard';
import { RegisterForm } from '@/components/auth/RegisterForm/RegisterForm';
import styles from './page.module.scss';

export default function RegisterPage() {
  return (
    <main className={styles.main}>
      <div className={styles.background}>
        <div className={styles.circle1} />
        <div className={styles.circle2} />
      </div>
      
      <AuthCard 
        title="Créer un compte" 
        subtitle="Rejoignez Trackr pour maîtriser votre budget"
      >
        <RegisterForm />
      </AuthCard>
    </main>
  );
}
