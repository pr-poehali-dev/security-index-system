import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useUIStore } from '@/stores/uiStore';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: string;
  breadcrumbs?: { label: string; href?: string }[];
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, icon, breadcrumbs, action }: PageHeaderProps) {
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb className="mb-3">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden flex-shrink-0"
          >
            <Icon name="Menu" size={24} />
          </Button>
          {icon && (
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name={icon as any} className="text-emerald-600" size={20} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{title}</h1>
            {description && (
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">{description}</p>
            )}
          </div>
        </div>
        {action && <div className="flex-shrink-0 w-full sm:w-auto">{action}</div>}
      </div>
    </div>
  );
}