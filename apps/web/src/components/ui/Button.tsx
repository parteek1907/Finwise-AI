import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg'; /* md is default from spec, large by default */
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
  const sizeClass = size === 'md' ? '' : styles[size];
  const buttonClass = `${styles.button} ${styles[variant]} ${sizeClass} ${className}`.trim();
  
  return (
    <button className={buttonClass} {...props}>
      {children}
      {icon && <span className={styles.icon}>{icon}</span>}
    </button>
  );
}
