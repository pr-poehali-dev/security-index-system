// src/components/layout/Sidebar.tsx
// Описание: Компонент боковой панели навигации с меню и профилем
import { memo, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { MODULES, ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Icon, { type IconName } from '@/components/ui/icon';
import NotificationBell from '@/components/NotificationBell';
import { cn } from '@/lib/utils';
import type { ModuleType } from '@/types';

const MODULE_ROUTES: Record<ModuleType, string> = {
  tenants: ROUTES.TENANTS,
  attestation: ROUTES.ATTESTATION,
  catalog: ROUTES.CATALOG,
  'facility-catalog': ROUTES.FACILITY_CATALOG,
  contractors: '',
  incidents: ROUTES.INCIDENTS,
  checklists: ROUTES.CHECKLISTS,
  tasks: ROUTES.TASKS,
  examination: ROUTES.EXAMINATION,
  maintenance: ROUTES.MAINTENANCE,
  budget: ROUTES.BUDGET,
  'training-center': ROUTES.TRAINING_CENTER,
  'knowledge-base': ROUTES.KNOWLEDGE_BASE,
  audit: ROUTES.AUDIT,
  settings: ROUTES.SETTINGS
};

const Sidebar = memo(function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebar } = useUIStore();
  const allNotifications = useNotificationsStore((state) => state.notifications);

  if (!user) return null;
  
  const incidentNotifications = useMemo(() => 
    allNotifications.filter(n => n.source === 'incident' && !n.isRead)
  , [allNotifications]);
  
  const attestationNotifications = useMemo(() => 
    allNotifications.filter(n => n.source === 'attestation' && !n.isRead)
  , [allNotifications]);
  
  const catalogNotifications = useMemo(() => 
    allNotifications.filter(n => n.source === 'catalog' && !n.isRead)
  , [allNotifications]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-gray-900 dark:bg-gray-950 text-white transition-all duration-300 z-30 flex flex-col",
      sidebarCollapsed ? "-translate-x-full w-16" : "translate-x-0 w-64",
      "lg:translate-x-0",
      sidebarCollapsed ? "lg:w-16" : "lg:w-64"
    )}>
      <div className={cn("border-b border-gray-800", sidebarCollapsed ? "p-2" : "p-4")}>
        <div className={cn(
          "flex items-center",
          sidebarCollapsed ? "flex-col gap-2" : "justify-between"
        )}>
          {sidebarCollapsed ? (
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Icon name="Shield" size={18} />
              </div>
              <NotificationBell />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="text-gray-400 hover:text-white hover:bg-gray-800 w-full"
              >
                <Icon name="ChevronRight" size={20} />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 animate-fade-in">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Icon name="Shield" size={18} />
                </div>
                <div>
                  <h2 className="font-bold text-sm">Индекс Безопасности</h2>
                  <p className="text-xs text-gray-400">{user.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <NotificationBell />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <Icon name="ChevronLeft" size={20} />
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {user.role !== 'SuperAdmin' && (
          <NavLink
            to={ROUTES.DASHBOARD}
            title={sidebarCollapsed ? "Дашборд" : ""}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-lg mb-1 transition-colors",
              sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
              isActive 
                ? "bg-emerald-600 text-white" 
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            )}
          >
            <Icon name="LayoutDashboard" size={20} />
            {!sidebarCollapsed && <span className="text-sm font-medium">Дашборд</span>}
          </NavLink>
        )}

        {user.availableModules.map((moduleKey) => {
          if (moduleKey === 'settings') return null;
          
          if (moduleKey === 'tenants') {
            return (
              <NavLink
                key={moduleKey}
                to={ROUTES.TENANTS}
                title={sidebarCollapsed ? "Управление тенантами" : ""}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-lg mb-1 transition-colors",
                  sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                  isActive 
                    ? "bg-emerald-600 text-white" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <Icon name="Building2" size={20} />
                {!sidebarCollapsed && <span className="text-sm font-medium">Управление тенантами</span>}
              </NavLink>
            );
          }


          
          const module = MODULES[moduleKey];
          const route = MODULE_ROUTES[moduleKey];
          
          if (!module || !route) return null;
          
          let notifications: import('@/types').Notification[] = [];
          if (moduleKey === 'incidents') notifications = incidentNotifications;
          if (moduleKey === 'attestation') notifications = attestationNotifications;
          if (moduleKey === 'catalog') notifications = catalogNotifications;
          
          const hasNotifications = notifications.length > 0;
          
          const linkElement = (
            <NavLink
              key={moduleKey}
              to={route}
              title={sidebarCollapsed ? module.name : ""}
              className={({ isActive }) => cn(
                "flex items-center gap-3 rounded-lg mb-1 transition-colors relative",
                sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                isActive 
                  ? "bg-emerald-600 text-white" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon name={module.icon} size={20} />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium flex items-center gap-2">
                  {module.name}
                  {hasNotifications && (
                    <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center p-0 text-xs">
                      {notifications.length > 99 ? '99+' : notifications.length}
                    </Badge>
                  )}
                </span>
              )}
              {sidebarCollapsed && hasNotifications && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </Badge>
              )}
            </NavLink>
          );
          
          return linkElement;
        })}
      </nav>

      <div className={cn("border-t border-gray-800 space-y-3", sidebarCollapsed ? "p-2" : "p-4")}>
        {user.availableModules.includes('settings') && (
          <NavLink
            to={ROUTES.SETTINGS}
            title={sidebarCollapsed ? "Настройки" : ""}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-lg mb-3 transition-colors",
              sidebarCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
              isActive 
                ? "bg-emerald-600 text-white" 
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            )}
          >
            <Icon name="Settings" size={20} />
            {!sidebarCollapsed && <span className="text-sm font-medium">Настройки</span>}
          </NavLink>
        )}
        
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
              title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            >
              <Icon name={theme === 'dark' ? 'Sun' : 'Moon'} size={18} />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">Тема</span>
            <div className="flex items-center gap-2">
              <Icon name="Sun" size={16} className="text-gray-400" />
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              <Icon name="Moon" size={16} className="text-gray-400" />
            </div>
          </div>
        )}

        <div className={cn("flex items-center", sidebarCollapsed ? "flex-col gap-2" : "gap-3")}>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-emerald-600 text-white text-xs">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          onClick={logout}
          size={sidebarCollapsed ? "icon" : "default"}
          className={cn(
            "w-full text-gray-300 hover:text-white hover:bg-gray-800",
            sidebarCollapsed ? "px-0" : ""
          )}
          title={sidebarCollapsed ? "Выход" : ""}
        >
          <Icon name="LogOut" size={18} className={sidebarCollapsed ? "" : "mr-2"} />
          {!sidebarCollapsed && <span className="text-sm">Выход</span>}
        </Button>
      </div>
    </aside>
  );
});

export default Sidebar;