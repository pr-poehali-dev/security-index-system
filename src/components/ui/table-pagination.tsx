import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
  onItemsPerPageChange?: (value: number) => void;
}

export default function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange
}: TablePaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t bg-background px-4 py-3">
      <div className="flex items-center gap-4">
        <p className="text-sm text-muted-foreground">
          Показано {startItem}-{endItem} из {totalItems}
        </p>
        
        {onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">На странице:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Icon name="ChevronLeft" size={16} />
        </Button>

        <div className="flex gap-1">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-1 text-sm text-muted-foreground">
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className="min-w-[36px]"
              >
                {page}
              </Button>
            )
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Icon name="ChevronRight" size={16} />
        </Button>
      </div>
    </div>
  );
}
