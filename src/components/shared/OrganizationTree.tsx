import { useCatalogStore } from '@/stores/catalogStore';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useState } from 'react';
import type { Organization } from '@/types/catalog';

interface OrganizationTreeNodeProps {
  organization: Organization;
  level?: number;
  onEdit?: (org: Organization) => void;
  onDelete?: (org: Organization) => void;
}

function OrganizationTreeNode({ organization, level = 0, onEdit, onDelete }: OrganizationTreeNodeProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { 
    selectedOrganization, 
    expandedNodes, 
    toggleExpandNode, 
    setSelectedOrganization,
    getObjectsByOrganization,
    deleteOrganization,
    organizations
  } = useCatalogStore();
  
  const isExpanded = expandedNodes.includes(organization.id);
  const isSelected = selectedOrganization === organization.id;
  const hasChildren = organization.children && organization.children.length > 0;
  const objectsCount = getObjectsByOrganization(organization.id).length;
  
  const handleDelete = () => {
    if (hasChildren) {
      toast.error('Невозможно удалить организацию с дочерними подразделениями');
      return;
    }
    
    if (objectsCount > 0) {
      toast.error('Невозможно удалить организацию с объектами');
      return;
    }
    
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    try {
      deleteOrganization(organization.id);
      if (selectedOrganization === organization.id) {
        setSelectedOrganization(null);
      }
      toast.success('Организация успешно удалена');
      onDelete?.(organization);
    } catch (error) {
      toast.error('Ошибка при удалении организации');
    } finally {
      setDeleteDialogOpen(false);
    }
  };
  
  const getTypeLabel = (type: Organization['type']) => {
    switch (type) {
      case 'holding': return 'Холдинг';
      case 'legal_entity': return 'Юр. лицо';
      case 'branch': return 'Филиал';
    }
  };
  
  const getTypeIcon = (type: Organization['type']) => {
    switch (type) {
      case 'holding': return 'Building2';
      case 'legal_entity': return 'Building';
      case 'branch': return 'MapPin';
    }
  };
  
  return (
    <>
    <div className="select-none">
      <div
        className={`
          flex items-center gap-2 py-2 px-3 rounded-lg transition-colors group
          ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}
        `}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpandNode(organization.id);
            }}
            className="p-0.5 hover:bg-primary/20 rounded"
          >
            <Icon 
              name={isExpanded ? 'ChevronDown' : 'ChevronRight'} 
              size={16} 
            />
          </button>
        )}
        
        {!hasChildren && <div className="w-5" />}
        
        <Icon 
          name={getTypeIcon(organization.type)} 
          size={18}
          className={isSelected ? 'text-primary' : 'text-muted-foreground'}
        />
        
        <span 
          className={`flex-1 font-medium cursor-pointer ${isSelected ? 'text-primary' : ''}`}
          onClick={() => setSelectedOrganization(organization.id)}
        >
          {organization.name}
        </span>
        
        <Badge variant="secondary" className="text-xs">
          {getTypeLabel(organization.type)}
        </Badge>
        
        {objectsCount > 0 && (
          <Badge variant="outline" className="text-xs">
            {objectsCount}
          </Badge>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/20 rounded transition-opacity"
            >
              <Icon name="MoreVertical" size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(organization)}>
              <Icon name="Edit" size={16} className="mr-2" />
              Редактировать
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600"
              disabled={hasChildren || objectsCount > 0}
            >
              <Icon name="Trash2" size={16} className="mr-2" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {organization.children!.map((child) => (
            <OrganizationTreeNode
              key={child.id}
              organization={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
    
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Удалить организацию?</AlertDialogTitle>
          <AlertDialogDescription>
            Вы уверены, что хотите удалить организацию <strong>{organization.name}</strong>?
            Это действие нельзя отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

interface OrganizationTreeProps {
  onEdit?: (org: Organization) => void;
  onDelete?: (org: Organization) => void;
}

export default function OrganizationTree({ onEdit, onDelete }: OrganizationTreeProps = {}) {
  const { getOrganizationTree } = useCatalogStore();
  const tree = getOrganizationTree();
  
  if (tree.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Icon name="Building" className="mx-auto mb-2" size={48} />
        <p>Организации не найдены</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      {tree.map((org) => (
        <OrganizationTreeNode 
          key={org.id} 
          organization={org}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}