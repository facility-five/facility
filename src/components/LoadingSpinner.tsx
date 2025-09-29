import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string; // Para classes adicionais do Tailwind
}

export const LoadingSpinner = ({ size = 'md', className = '' }: LoadingSpinnerProps) => {
  let spinnerSizeClasses = '';
  let borderWidthClasses = '';

  switch (size) {
    case 'sm':
      spinnerSizeClasses = 'h-6 w-6';
      borderWidthClasses = 'border-2';
      break;
    case 'md':
      spinnerSizeClasses = 'h-10 w-10';
      borderWidthClasses = 'border-2';
      break;
    case 'lg':
      spinnerSizeClasses = 'h-16 w-16';
      borderWidthClasses = 'border-4';
      break;
  }

  return (
    <div
      className={`inline-block animate-spin rounded-full ${spinnerSizeClasses} ${borderWidthClasses} border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] ${className}`}
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Carregando...
      </span>
    </div>
  );
};