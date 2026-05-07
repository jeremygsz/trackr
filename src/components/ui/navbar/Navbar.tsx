'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Wallet, 
  Tag, 
  Store, 
  LayoutDashboard, 
  Plus, 
  LogOut, 
  User as UserIcon,
  ChevronDown,
  Settings
} from 'lucide-react';
import { ThemeToggle } from '../theme-toggle/ThemeToggle';
import { Button } from '../button/Button';
import styles from './Navbar.module.scss';

interface NavbarProps {
  onNewTransaction: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNewTransaction }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user;

  const navLinks = [
    { label: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Banques', href: '/banks', icon: Wallet },
    { label: 'Catégories', href: '/categories', icon: Tag },
    { label: 'Magasins', href: '/stores', icon: Store },
  ];

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserInitials = () => {
    if (!user?.firstname || !user?.lastname) return 'U';
    return `${user.firstname.charAt(0)}${user.lastname.charAt(0)}`.toUpperCase();
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

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
            <Button onClick={onNewTransaction} className={styles.newBtn}>
              <Plus size={18} />
              <span>Nouvelle transaction</span>
            </Button>

            {user && (
              <div className={styles.userMenuContainer} ref={userMenuRef}>
                <button 
                  className={styles.userTrigger}
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className={styles.avatar}>
                    {getUserInitials()}
                  </div>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.firstname}</span>
                    <ChevronDown size={14} className={`${styles.chevron} ${isUserMenuOpen ? styles.open : ''}`} />
                  </div>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className={styles.userDropdown}
                    >
                      <div className={styles.dropdownHeader}>
                        <p className={styles.fullName}>{user.firstname} {user.lastname}</p>
                        <p className={styles.email}>{user.email}</p>
                      </div>
                      <div className={styles.dropdownDivider} />
                      <Link href="/profile" className={styles.dropdownItem} onClick={() => setIsUserMenuOpen(false)}>
                        <UserIcon size={16} />
                        <span>Mon Profil</span>
                      </Link>
                      <Link href="/settings" className={styles.dropdownItem} onClick={() => setIsUserMenuOpen(false)}>
                        <Settings size={16} />
                        <span>Paramètres</span>
                      </Link>
                      <div className={styles.dropdownDivider} />
                      <div className={styles.dropdownTheme}>
                        <span className={styles.themeLabel}>Thème</span>
                        <ThemeToggle />
                      </div>
                      <div className={styles.dropdownDivider} />
                      <button className={`${styles.dropdownItem} ${styles.logout}`} onClick={handleSignOut}>
                        <LogOut size={16} />
                        <span>Déconnexion</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
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
              {user && (
                <div className={styles.mobileUserHeader}>
                  <div className={styles.avatar}>
                    {getUserInitials()}
                  </div>
                  <div className={styles.mobileUserInfo}>
                    <span className={styles.mobileUserName}>{user.firstname} {user.lastname}</span>
                    <span className={styles.mobileUserEmail}>{user.email}</span>
                  </div>
                </div>
              )}

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

              <div className={styles.dropdownDivider} />
              
              <Link 
                href="/profile" 
                className={styles.mobileLink}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <UserIcon size={20} />
                <span>Mon Profil</span>
              </Link>
              
              <Link 
                href="/settings" 
                className={styles.mobileLink}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings size={20} />
                <span>Paramètres</span>
              </Link>

              <div className={styles.mobileTheme}>
                <span className={styles.themeLabel}>Thème</span>
                <ThemeToggle />
              </div>

              <div className={styles.mobileActions}>
                <Button 
                  variant="ghost"
                  onClick={handleSignOut}
                  fullWidth
                  className={styles.mobileLogout}
                >
                  <LogOut size={18} />
                  Déconnexion
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
