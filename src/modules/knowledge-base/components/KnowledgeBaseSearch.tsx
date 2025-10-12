import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface KnowledgeBaseSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function KnowledgeBaseSearch({
  searchQuery,
  onSearchChange
}: KnowledgeBaseSearchProps) {
  return (
    <Card className="p-4">
      <div className="relative">
        <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Поиск по названию, описанию или тегам..."
          className="pl-10"
        />
      </div>
    </Card>
  );
}
