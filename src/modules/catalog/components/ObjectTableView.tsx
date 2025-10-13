import { useState, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import TablePagination from '@/components/ui/table-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { SortableTableHeader, type SortDirection } from '@/components/ui/sortable-table-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCatalogStore } from '@/stores/catalogStore';
import { exportToCSV, exportToExcel, type ExportColumn } from '@/utils/export';
import type { IndustrialObject } from '@/types/catalog';

interface ObjectTableViewProps {
  objects: IndustrialObject[];
  onView: (object: IndustrialObject) => void;
  onEdit: (object: IndustrialObject) => void;
}

const getStatusColor = (status: IndustrialObject['status']) => {
  switch (status) {
    case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
    case 'conservation': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
    case 'liquidated': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
  }
};

const getStatusLabel = (status: IndustrialObject['status']) => {
  switch (status) {
    case 'active': return 'Активен';
    case 'conservation': return 'На консервации';
    case 'liquidated': return 'Ликвидирован';
  }
};

const getTypeLabel = (type: IndustrialObject['type']) => {
  switch (type) {
    case 'opo': return 'ОПО';
    case 'gts': return 'ГТС';
    case 'building': return 'Здание';
  }
};

export default function ObjectTableView({ objects, onView, onEdit }: ObjectTableViewProps) {
  const { organizations } = useCatalogStore();
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: SortDirection }>({ 
    field: 'name', 
    direction: 'asc' 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const handleSort = (field: string) => {
    setSortConfig(prev => {
      if (prev.field !== field) {
        return { field, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { field, direction: 'desc' };
      }
      if (prev.direction === 'desc') {
        return { field, direction: null };
      }
      return { field, direction: 'asc' };
    });
  };

  const sortedObjects = useMemo(() => {
    if (!sortConfig.direction) return objects;

    return [...objects].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'registrationNumber':
          aValue = a.registrationNumber.toLowerCase();
          bValue = b.registrationNumber.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'organization':
          aValue = organizations.find(org => org.id === a.organizationId)?.name.toLowerCase() || '';
          bValue = organizations.find(org => org.id === b.organizationId)?.name.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'nextExpertiseDate':
          aValue = a.nextExpertiseDate ? new Date(a.nextExpertiseDate).getTime() : 0;
          bValue = b.nextExpertiseDate ? new Date(b.nextExpertiseDate).getTime() : 0;
          break;
        case 'responsiblePerson':
          aValue = a.responsiblePerson.toLowerCase();
          bValue = b.responsiblePerson.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [objects, sortConfig, organizations]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isDateExpired = (date: string | undefined) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  const isDateSoon = (date: string | undefined) => {
    if (!date) return false;
    const diffDays = Math.floor((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 90 && diffDays >= 0;
  };

  const handleExport = (format: 'csv' | 'excel') => {
    const columns: ExportColumn<IndustrialObject>[] = [
      { key: 'name', label: 'Название' },
      { key: 'registrationNumber', label: 'Рег. номер' },
      { 
        key: 'type', 
        label: 'Тип',
        format: (value) => getTypeLabel(value)
      },
      { 
        key: 'organizationId', 
        label: 'Организация',
        format: (value) => organizations.find(org => org.id === value)?.name || '-'
      },
      { 
        key: 'status', 
        label: 'Статус',
        format: (value) => getStatusLabel(value)
      },
      { 
        key: 'nextExpertiseDate', 
        label: 'Следующая ЭПБ',
        format: (value) => value ? formatDate(value) : '-'
      },
      { key: 'responsiblePerson', label: 'Ответственный' }
    ];

    const filename = `Объекты_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}`;

    if (format === 'csv') {
      exportToCSV(sortedObjects, columns, filename);
    } else {
      exportToExcel(sortedObjects, columns, filename, 'Объекты');
    }
  };

  const totalPages = Math.ceil(sortedObjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedObjects = sortedObjects.slice(startIndex, endIndex);
  
  const useVirtualization = paginatedObjects.length > 20;

  const TableRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const obj = paginatedObjects[index];
    const organization = organizations.find(org => org.id === obj.organizationId);
    
    return (
      <div 
        style={style}
        className="border-b last:border-b-0 hover:bg-muted/30 transition-colors flex items-stretch"
      >
        <div className="flex w-full items-center">
          <div className="p-3 flex-[2] min-w-0">
            <div className="flex items-start gap-2">
              <Icon name="Building" size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-medium truncate">{obj.name}</p>
                <p className="text-xs text-muted-foreground truncate">{obj.location.address}</p>
              </div>
            </div>
          </div>
          <div className="p-3 flex-1">
            <code className="text-xs bg-muted px-2 py-1 rounded">
              {obj.registrationNumber}
            </code>
          </div>
          <div className="p-3 flex-1">
            <Badge variant="outline" className="whitespace-nowrap">
              {getTypeLabel(obj.type)}
              {obj.hazardClass && ` • ${obj.hazardClass}`}
            </Badge>
          </div>
          <div className="p-3 flex-1 truncate">
            <p className="text-sm truncate">{organization?.name || '-'}</p>
          </div>
          <div className="p-3 flex-1">
            <Badge className={getStatusColor(obj.status)}>
              {getStatusLabel(obj.status)}
            </Badge>
          </div>
          <div className="p-3 flex-1">
            {obj.nextExpertiseDate ? (
              <div className="flex items-center gap-1">
                {isDateExpired(obj.nextExpertiseDate) && (
                  <Icon name="AlertCircle" size={14} className="text-red-500" />
                )}
                {isDateSoon(obj.nextExpertiseDate) && !isDateExpired(obj.nextExpertiseDate) && (
                  <Icon name="Clock" size={14} className="text-amber-500" />
                )}
                <span className={`text-sm ${
                  isDateExpired(obj.nextExpertiseDate)
                    ? 'text-red-600 font-semibold'
                    : isDateSoon(obj.nextExpertiseDate)
                    ? 'text-amber-600 font-semibold'
                    : ''
                }`}>
                  {formatDate(obj.nextExpertiseDate)}
                </span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">-</span>
            )}
          </div>
          <div className="p-3 flex-1 truncate">
            <p className="text-sm truncate">{obj.responsiblePerson}</p>
          </div>
          <div className="p-3 flex-shrink-0">
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(obj)}
                title="Просмотр"
              >
                <Icon name="Eye" size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(obj)}
                title="Редактировать"
              >
                <Icon name="Edit" size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Icon name="Download" size={16} className="mr-2" />
              Экспорт
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              <Icon name="FileText" size={16} className="mr-2" />
              Экспорт в CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('excel')}>
              <Icon name="FileSpreadsheet" size={16} className="mr-2" />
              Экспорт в Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1400px]">
            <div className="bg-muted/50 border-b flex">
              <SortableTableHeader
                label="Название"
                field="name"
                currentSort={sortConfig}
                onSort={handleSort}
                className="flex-[2]"
              />
              <SortableTableHeader
                label="Рег. номер"
                field="registrationNumber"
                currentSort={sortConfig}
                onSort={handleSort}
                className="flex-1"
              />
              <SortableTableHeader
                label="Тип"
                field="type"
                currentSort={sortConfig}
                onSort={handleSort}
                className="flex-1"
              />
              <SortableTableHeader
                label="Организация"
                field="organization"
                currentSort={sortConfig}
                onSort={handleSort}
                className="flex-1"
              />
              <SortableTableHeader
                label="Статус"
                field="status"
                currentSort={sortConfig}
                onSort={handleSort}
                className="flex-1"
              />
              <SortableTableHeader
                label="Следующая ЭПБ"
                field="nextExpertiseDate"
                currentSort={sortConfig}
                onSort={handleSort}
                className="flex-1"
              />
              <SortableTableHeader
                label="Ответственный"
                field="responsiblePerson"
                currentSort={sortConfig}
                onSort={handleSort}
                className="flex-1"
              />
              <div className="text-right p-3 font-semibold text-sm flex-shrink-0 w-32">Действия</div>
            </div>

            {paginatedObjects.length > 0 && (
              useVirtualization ? (
                <List
                  height={Math.min(paginatedObjects.length * 80, 600)}
                  itemCount={paginatedObjects.length}
                  itemSize={80}
                  width="100%"
                  className="scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                  overscanCount={5}
                >
                  {TableRow as any}
                </List>
              ) : (
                <div>
                  {paginatedObjects.map((obj, index) => (
                    <TableRow key={obj.id} index={index} style={{}} />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      
        {sortedObjects.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="Search" className="mx-auto mb-3" size={48} />
            <p>Объекты не найдены</p>
          </div>
        )}
        
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={sortedObjects.length}
          onItemsPerPageChange={(value) => {
            setItemsPerPage(value);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}