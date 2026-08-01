import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon,
  className = '',
  ...props 
}: ButtonProps) {
  const buttonClass = `${styles.button} ${styles[variant]} ${styles[size]} ${className}`;
  
  return (
    <button className={buttonClass} {...props}>
      {children}
      {icon && <span className={styles.icon}>{icon}</span>}
    </button>
  );
}
