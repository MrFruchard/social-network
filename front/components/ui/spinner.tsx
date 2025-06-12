import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'white';
  className?: string;
}

const sizeClasses = {
  xs: 'h-3 w-3 border',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-2',
  xl: 'h-12 w-12 border-4'
};

const variantClasses = {
  default: 'border-muted-foreground border-t-transparent',
  primary: 'border-primary border-t-transparent',
  secondary: 'border-secondary border-t-transparent',
  white: 'border-white border-t-transparent'
};

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'default',
  className
}) => {
  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label="Chargement en cours"
    />
  );
};

// Composant pour les états de chargement complets
export interface LoadingStateProps {
  message?: string;
  size?: SpinnerProps['size'];
  variant?: SpinnerProps['variant'];
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Chargement...',
  size = 'lg',
  variant = 'primary',
  className
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-4 p-8',
      className
    )}>
      <Spinner size={size} variant={variant} />
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
};

// Composant pour les overlays de chargement
export interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Chargement...',
  children,
  className
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <Spinner size="lg" variant="primary" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour les skeleton loading (à utiliser avec les cartes)
export interface SkeletonProps {
  className?: string;
  lines?: number;
  showAvatar?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  lines = 3,
  showAvatar = false
}) => {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="flex items-start space-x-4">
        {showAvatar && (
          <div className="rounded-full bg-muted h-10 w-10 flex-shrink-0" />
        )}
        <div className="flex-1 space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-4 bg-muted rounded',
                i === lines - 1 ? 'w-3/4' : 'w-full'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export { Spinner };