import Icon from '@/components/ui/icon';

interface LoadingSpinnerProps {
  size?: number;
  text?: string;
}

export default function LoadingSpinner({ size = 32, text = 'Загрузка...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <Icon name="Loader2" className="animate-spin" size={size} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
