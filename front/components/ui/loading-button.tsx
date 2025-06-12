import * as React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, loading = false, loadingText, spinnerSize = 'sm', children, disabled, ...props }, ref) => {
    const spinnerSizes = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5', 
      lg: 'h-6 w-6'
    };

    return (
      <Button
        ref={ref}
        className={cn(className)}
        disabled={loading || disabled}
        {...props}
      >
        {loading && (
          <div
            className={cn(
              'animate-spin border-2 border-current border-t-transparent rounded-full mr-2',
              spinnerSizes[spinnerSize]
            )}
          />
        )}
        {loading ? loadingText || children : children}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

export { LoadingButton };