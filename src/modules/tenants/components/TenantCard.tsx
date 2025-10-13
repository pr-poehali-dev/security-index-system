import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { MODULES } from '@/lib/constants';
import type { Tenant } from '@/types';

interface TenantCardProps {
  tenant: Tenant;
  onEdit: (tenantId: string) => void;
  onShowCredentials: (tenantId: string) => void;
  onToggleStatus: (tenantId: string) => void;
}

export default function TenantCard({ tenant, onEdit, onShowCredentials, onToggleStatus }: TenantCardProps) {
  const [copied, setCopied] = useState(false);
  const daysUntilExpiry = Math.floor((new Date(tenant.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpiring = daysUntilExpiry <= 30;

  const copyId = async () => {
    await navigator.clipboard.writeText(tenant.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="hover-scale">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <Icon name="Building2" className="text-emerald-600" size={24} />
            </div>
            <div>
              <CardTitle className="text-lg">{tenant.name}</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">ИНН: {tenant.inn}</p>
              <div className="flex items-center gap-1 mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-500 font-mono">ID: {tenant.id}</p>
                <button
                  onClick={copyId}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Скопировать ID"
                >
                  <Icon name={copied ? 'Check' : 'Copy'} size={12} className={copied ? 'text-emerald-600' : 'text-gray-500'} />
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => onToggleStatus(tenant.id)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              tenant.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'
            }`}
            title={tenant.status === 'active' ? 'Деактивировать' : 'Активировать'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                tenant.status === 'active' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Администратор</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{tenant.adminName}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{tenant.adminEmail}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Срок действия</p>
            <p className={`text-sm font-medium ${isExpiring ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>
              {new Date(tenant.expiresAt).toLocaleDateString('ru-RU')}
            </p>
            <p className={`text-xs ${isExpiring ? 'text-amber-600' : 'text-gray-600 dark:text-gray-400'}`}>
              Осталось {daysUntilExpiry} дней
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Доступные модули ({tenant.modules.length})</p>
          <div className="flex flex-wrap gap-1">
            {tenant.modules.map((moduleKey) => (
              <Badge key={moduleKey} variant="outline" className="text-xs">
                {MODULES[moduleKey].name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit(tenant.id)}
          >
            <Icon name="Settings" className="mr-2" size={14} />
            Настроить
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onShowCredentials(tenant.id)}
          >
            <Icon name="Key" className="mr-2" size={14} />
            Учетные данные
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}