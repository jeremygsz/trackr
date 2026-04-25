'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './Select.module.scss';
import { ChevronDown, Search, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
  name?: string;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Choisir une option...",
  error,
  icon,
  className = '',
  name,
  required
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`${styles.container} ${className}`} ref={containerRef}>
      {label && <label className={styles.label}>{label}</label>}
      
      <div 
        className={`${styles.selectWrapper} ${error ? styles.hasError : ''} ${isOpen ? styles.isOpen : ''}`}
        onClick={handleToggle}
      >
        {icon && <span className={styles.icon}>{icon}</span>}
        
        <div className={styles.currentValue}>
          {selectedOption ? selectedOption.label : <span className={styles.placeholder}>{placeholder}</span>}
        </div>

        <input type="hidden" name={name} value={value || ''} required={required} />

        <span className={styles.arrow}>
          <ChevronDown size={18} />
        </span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className={styles.dropdown}>
            <div className={styles.searchWrapper}>
              <Search size={14} className={styles.searchIcon} />
              <input
                ref={inputRef}
                type="text"
                className={styles.searchInput}
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              {searchQuery && (
                <X 
                  size={14} 
                  className={styles.clearIcon} 
                  onClick={(e) => { e.stopPropagation(); setSearchQuery(''); }} 
                />
              )}
            </div>

            <div className={styles.optionsList}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`${styles.option} ${value === option.value ? styles.selected : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(option.value);
                    }}
                  >
                    {option.label}
                  </div>
                ))
              ) : (
                <div className={styles.noResults}>Aucun résultat trouvé</div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
};

// Internal wrapper to avoid dependency issues if Framer Motion is used
const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>;
