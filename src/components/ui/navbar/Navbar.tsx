'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Wallet, Tag, Store, LayoutDashboard, Plus } from 'lucide-react';
import { ThemeToggle } from '../theme-toggle/ThemeToggle';
import { Button } from '../button/Button';
import styles from './Navbar.module.scss';

interface NavbarProps {
  onNewTransaction: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNewTransaction }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Banques', href: '/banks', icon: Wallet },
    { label: 'Catégories', href: '/categories', icon: Tag },
    { label: 'Magasins', href: '/stores', icon: Store },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.left}>
          <Link href="/dashboard" className={styles.logo}>
            <div className={styles.logoIcon}>T</div>
            <span className={styles.logoText}>trackr</span>
          </Link>

          <div className={styles.desktopLinks}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.desktopActions}>
            <ThemeToggle />
            <Button onClick={onNewTransaction} className={styles.newBtn}>
              <Plus size={18} />
              <span>Nouvelle transaction</span>
            </Button>
          </div>

          <button 
            className={styles.burgerMenu} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={styles.mobileMenu}
          >
            <div className={styles.mobileLinks}>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.href} 
                    href={link.href} 
                    className={`${styles.mobileLink} ${isActive ? styles.active : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon size={20} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <div className={styles.mobileActions}>
                <div className={styles.mobileTheme}>
                  <span>Thème</span>
                  <ThemeToggle />
                </div>
                <Button 
                  onClick={() => {
                    onNewTransaction();
                    setIsMobileMenuOpen(false);
                  }} 
                  fullWidth
                >
                  <Plus size={18} />
                  Nouvelle transaction
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
