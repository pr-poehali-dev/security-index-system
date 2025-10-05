import { useCatalogStore } from '@/stores/catalogStore';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import type { Organization } from '@/types/catalog';

interface OrganizationTreeNodeProps {
  organization: Organization;
  level?: number;
}

function OrganizationTreeNode({ organization, level = 0 }: OrganizationTreeNodeProps) {
  const { 
    selectedOrganization, 
    expandedNodes, 
    toggleExpandNode, 
    setSelectedOrganization,
    getObjectsByOrganization 
  } = useCatalogStore();
  
  const isExpanded = expandedNodes.includes(organization.id);
  const isSelected = selectedOrganization === organization.id;
  const hasChildren = organization.children && organization.children.length > 0;
  const objectsCount = getObjectsByOrganization(organization.id).length;
  
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
    <div className="select-none">
      <div
        className={`
          flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors
          ${isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}
        `}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
        onClick={() => setSelectedOrganization(organization.id)}
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
        
        <span className={`flex-1 font-medium ${isSelected ? 'text-primary' : ''}`}>
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
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {organization.children!.map((child) => (
            <OrganizationTreeNode
              key={child.id}
              organization={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizationTree() {
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
        <OrganizationTreeNode key={org.id} organization={org} />
      ))}
    </div>
  );
}
