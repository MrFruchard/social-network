import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input, InputProps } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface FormFieldProps extends Omit<InputProps, 'id'> {
  label: string;
  id: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  validationState?: 'default' | 'success' | 'error' | 'loading';
  labelClassName?: string;
  errorClassName?: string;
  helpClassName?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({
    label,
    id,
    error,
    helpText,
    required = false,
    validationState = 'default',
    className,
    labelClassName,
    errorClassName,
    helpClassName,
    ...props
  }, ref) => {
    const getValidationClasses = () => {
      switch (validationState) {
        case 'success':
          return 'border-green-500 focus:border-green-500 border-2';
        case 'error':
          return 'border-red-500 focus:border-red-500';
        case 'loading':
          return 'border-blue-500 focus:border-blue-500';
        default:
          return '';
      }
    };

    return (
      <div className="space-y-2">
        <Label 
          htmlFor={id}
          className={cn(
            'block text-sm font-medium',
            required && "after:content-['*'] after:ml-0.5 after:text-red-500",
            labelClassName
          )}
        >
          {label}
        </Label>
        
        <Input
          ref={ref}
          id={id}
          className={cn(
            'transition-colors duration-200',
            getValidationClasses(),
            className
          )}
          {...props}
        />
        
        {error && (
          <p className={cn(
            'text-sm text-red-600',
            errorClassName
          )}>
            {error}
          </p>
        )}
        
        {helpText && !error && (
          <p className={cn(
            'text-sm text-muted-foreground',
            helpClassName
          )}>
            {helpText}
          </p>
        )}
        
        {validationState === 'loading' && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full" />
            Vérification en cours...
          </div>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export { FormField };