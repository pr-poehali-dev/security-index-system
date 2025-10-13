// src/components/common/EmptyState.tsx
// Компонент для отображения пустого состояния с иконкой и текстом

import Icon from '@/components/ui/icon';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
  iconSize?: number;
}

export default function EmptyState({
  icon = 'Search',
  title = 'Ничего не найдено',
  description,
  iconSize = 48
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon name={icon} size={iconSize} className="mx-auto mb-4 opacity-20 text-muted-foreground" />
      <p className="text-muted-foreground font-medium">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  );
}