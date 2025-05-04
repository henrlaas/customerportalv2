
import React, { ButtonHTMLAttributes } from 'react';

export interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'default' | 'sm' | 'lg';
  isBlock?: boolean;
  isIcon?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  variant = 'primary',
  size = 'default',
  isBlock = false,
  isIcon = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  ...props
}) => {
  const variantClass = `playful-btn-${variant}`;
  const sizeClass = size === 'default' ? '' : `playful-btn-${size}`;
  const blockClass = isBlock ? 'playful-btn-block' : '';
  const iconClass = isIcon ? 'playful-btn-icon' : '';

  return (
    <button
      className={`playful-btn ${variantClass} ${sizeClass} ${blockClass} ${iconClass} ${className}`}
      {...props}
    >
      {leftIcon && <span className="playful-btn-icon-left">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="playful-btn-icon-right">{rightIcon}</span>}
    </button>
  );
};
