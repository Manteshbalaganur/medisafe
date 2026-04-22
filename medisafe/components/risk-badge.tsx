'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RiskBadgeProps {
  level: 'low' | 'moderate' | 'high';
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const config = {
    low: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-800 dark:text-green-200',
      label: 'Low Risk',
    },
    moderate: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-800 dark:text-yellow-200',
      label: 'Moderate Risk',
    },
    high: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-800 dark:text-red-200',
      label: 'High Risk',
    },
  };

  const { bg, text, label } = config[level];

  return (
    <span className={cn('px-3 py-1 rounded-full text-sm font-medium', bg, text)}>
      {label}
    </span>
  );
}
