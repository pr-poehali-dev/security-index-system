import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function InstructorsDirectory() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Icon name="GraduationCap" size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Преподаватели</h3>
            <p className="text-muted-foreground max-w-md">
              Управление базой преподавателей и их специализациями
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
