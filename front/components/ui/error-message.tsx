import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, XCircle, AlertTriangle } from 'lucide-react';

export interface ErrorMessageProps {
  message: string;
  variant?: 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
  onDismiss?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  variant = 'error',
  size = 'md',
  showIcon = true,
  className,
  onDismiss
}) => {
  const variantClasses = {
    error: 'text-red-600 bg-red-50 border-red-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200'
  };

  const sizeClasses = {
    sm: 'text-xs p-2',
    md: 'text-sm p-3',
    lg: 'text-base p-4'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const getIcon = () => {
    switch (variant) {
      case 'error':
        return <XCircle className={iconSizes[size]} />;
      case 'warning':
        return <AlertTriangle className={iconSizes[size]} />;
      case 'info':
        return <AlertCircle className={iconSizes[size]} />;
      default:
        return <XCircle className={iconSizes[size]} />;
    }
  };

  if (!message) return null;

  return (
    <div className={cn(
      'border rounded-md flex items-start gap-2',
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {showIcon && (
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        {message}
      </div>
      
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Fermer le message d'erreur"
        >
          <XCircle className={iconSizes[size]} />
        </button>
      )}
    </div>
  );
};

// Composant spécialisé pour les erreurs de champs de formulaire
export interface FieldErrorProps {
  error?: string;
  className?: string;
}

export const FieldError: React.FC<FieldErrorProps> = ({ error, className }) => {
  if (!error) return null;
  
  return (
    <ErrorMessage
      message={error}
      variant="error"
      size="sm"
      showIcon={false}
      className={cn('mt-1 border-none bg-transparent p-0', className)}
    />
  );
};

// Composant pour les messages de succès
export interface SuccessMessageProps {
  message: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
  onDismiss?: () => void;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  size = 'md',
  showIcon = true,
  className,
  onDismiss
}) => {
  const sizeClasses = {
    sm: 'text-xs p-2',
    md: 'text-sm p-3',
    lg: 'text-base p-4'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  if (!message) return null;

  return (
    <div className={cn(
      'text-green-600 bg-green-50 border border-green-200 rounded-md flex items-start gap-2',
      sizeClasses[size],
      className
    )}>
      {showIcon && (
        <div className="flex-shrink-0 mt-0.5">
          <AlertCircle className={iconSizes[size]} />
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        {message}
      </div>
      
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-2 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Fermer le message de succès"
        >
          <XCircle className={iconSizes[size]} />
        </button>
      )}
    </div>
  );
};

export { ErrorMessage };