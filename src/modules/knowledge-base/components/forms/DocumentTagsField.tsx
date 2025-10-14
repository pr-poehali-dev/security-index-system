import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface DocumentTagsFieldProps {
  tags: string[];
  tagInput: string;
  onTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
}

export default function DocumentTagsField({
  tags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
}: DocumentTagsFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="tags">Теги</Label>
      <div className="flex gap-2">
        <Input
          id="tags"
          value={tagInput}
          onChange={(e) => onTagInputChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddTag();
            }
          }}
          placeholder="Добавьте тег и нажмите Enter"
        />
        <Button type="button" variant="outline" size="icon" onClick={onAddTag}>
          <Icon name="Plus" size={16} />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="ml-1 hover:text-destructive"
              >
                <Icon name="X" size={12} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
