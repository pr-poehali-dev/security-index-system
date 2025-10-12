// src/components/ui/search-bar.tsx
// Описание: UI компонент строки поиска с иконкой и очисткой
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Поиск...', className = '' }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <Icon 
        name="Search" 
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
        size={18} 
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-10"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <Icon name="X" size={18} />
        </button>
      )}
    </div>
  );
}