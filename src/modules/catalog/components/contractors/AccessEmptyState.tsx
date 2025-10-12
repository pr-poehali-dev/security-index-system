import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AccessEmptyStateProps {
  onGrantAccess: () => void;
}

export default function AccessEmptyState({ onGrantAccess }: AccessEmptyStateProps) {
  return (
    <Card className="p-12 text-center">
      <Icon
        name="ShieldOff"
        size={48}
        className="mx-auto text-muted-foreground mb-4"
      />
      <h3 className="text-lg font-semibold mb-2">Нет записей о доступе</h3>
      <p className="text-muted-foreground mb-4">
        Назначьте сотрудников на объекты для контроля доступа
      </p>
      <Button onClick={onGrantAccess}>
        <Icon name="KeyRound" size={16} className="mr-2" />
        Предоставить доступ
      </Button>
    </Card>
  );
}
