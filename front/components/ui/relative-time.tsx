import * as React from 'react';
import { cn } from '@/lib/utils';
import { timeAgo, formatSmartDate, formatDateTime } from '@/lib/utils/time';

export interface RelativeTimeProps {
  date: string | Date;
  variant?: 'relative' | 'smart' | 'full';
  className?: string;
  showTooltip?: boolean;
}

const RelativeTime: React.FC<RelativeTimeProps> = ({
  date,
  variant = 'relative',
  className,
  showTooltip = true
}) => {
  const getDisplayText = () => {
    switch (variant) {
      case 'relative':
        return timeAgo(date);
      case 'smart':
        return formatSmartDate(date);
      case 'full':
        return formatDateTime(date);
      default:
        return timeAgo(date);
    }
  };

  const displayText = getDisplayText();
  const fullDateTime = formatDateTime(date, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (showTooltip) {
    return (
      <time
        dateTime={new Date(date).toISOString()}
        title={fullDateTime}
        className={cn(
          'text-muted-foreground cursor-help',
          className
        )}
      >
        {displayText}
      </time>
    );
  }

  return (
    <time
      dateTime={new Date(date).toISOString()}
      className={cn(
        'text-muted-foreground',
        className
      )}
    >
      {displayText}
    </time>
  );
};

export { RelativeTime };