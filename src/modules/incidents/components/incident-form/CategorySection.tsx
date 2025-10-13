import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CategorySectionProps {
  categoryId: string;
  subcategoryId: string;
  fundingTypeId: string;
  categories: Array<{ id: string; name: string }>;
  subcategories: Array<{ id: string; name: string }>;
  fundingTypes: Array<{ id: string; name: string }>;
  onCategoryChange: (categoryId: string) => void;
  onUpdate: (field: string, value: string) => void;
}

export default function CategorySection({
  categoryId,
  subcategoryId,
  fundingTypeId,
  categories,
  subcategories,
  fundingTypes,
  onCategoryChange,
  onUpdate
}: CategorySectionProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="fundingTypeId">Обеспечение выполнения работ *</Label>
        <Select value={fundingTypeId} onValueChange={(v) => onUpdate('fundingTypeId', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип" />
          </SelectTrigger>
          <SelectContent>
            {fundingTypes.map((fund) => (
              <SelectItem key={fund.id} value={fund.id}>{fund.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryId">Категория несоответствия *</Label>
        <Select value={categoryId} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите категорию" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 col-span-2">
        <Label htmlFor="subcategoryId">Подкатегория несоответствия *</Label>
        <Select 
          value={subcategoryId} 
          onValueChange={(v) => onUpdate('subcategoryId', v)}
          disabled={!categoryId}
        >
          <SelectTrigger>
            <SelectValue placeholder={categoryId ? "Выберите подкатегорию" : "Сначала выберите категорию"} />
          </SelectTrigger>
          <SelectContent>
            {subcategories.map((sub) => (
              <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
