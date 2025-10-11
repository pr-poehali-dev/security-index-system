import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import type { Incident } from '@/types';
import funcUrls from '../../../../backend/func2url.json';

interface IncidentRemindersProps {
  incidents: Incident[];
  getOrganizationName: (orgId: string) => string;
  getDirectionName: (directionId: string) => string;
  onIncidentClick: (incident: Incident) => void;
}

export default function IncidentReminders({
  incidents,
  getOrganizationName,
  getDirectionName,
  onIncidentClick
}: IncidentRemindersProps) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const reminders = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const urgentReminders = incidents.filter(inc => {
      if (inc.status === 'completed' || inc.status === 'completed_late') return false;
      
      const plannedDate = new Date(inc.plannedDate);
      plannedDate.setHours(0, 0, 0, 0);
      
      const daysUntilDeadline = Math.ceil((plannedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return daysUntilDeadline <= 7 && daysUntilDeadline >= 0;
    }).sort((a, b) => a.daysLeft - b.daysLeft);

    const critical = urgentReminders.filter(inc => inc.daysLeft <= 3);
    const warning = urgentReminders.filter(inc => inc.daysLeft > 3 && inc.daysLeft <= 7);

    return { critical, warning, all: urgentReminders };
  }, [incidents]);

  const sendEmailReminder = async () => {
    if (!email || reminders.all.length === 0) return;
    
    setSending(true);
    setSent(false);
    
    try {
      const incidentsData = reminders.all.map(inc => ({
        description: inc.description,
        organization: getOrganizationName(inc.organizationId),
        direction: getDirectionName(inc.directionId),
        daysLeft: inc.daysLeft
      }));
      
      const response = await fetch(funcUrls['send-reminders'], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          incidents: incidentsData
        })
      });
      
      if (response.ok) {
        setSent(true);
        setTimeout(() => setSent(false), 3000);
      }
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setSending(false);
    }
  };

  if (reminders.all.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon name="Bell" size={18} className="text-orange-600" />
            Напоминания о сроках
            <Badge variant="secondary">{reminders.all.length}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Email для уведомлений"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-64"
            />
            <Button
              onClick={sendEmailReminder}
              disabled={!email || sending}
              size="sm"
              variant={sent ? 'default' : 'outline'}
            >
              {sending ? (
                <Icon name="Loader2" size={16} className="animate-spin" />
              ) : sent ? (
                <Icon name="Check" size={16} />
              ) : (
                <Icon name="Mail" size={16} />
              )}
              {sending ? 'Отправка...' : sent ? 'Отправлено' : 'Отправить'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {reminders.critical.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-red-600 flex items-center gap-1">
              <Icon name="AlertCircle" size={14} />
              Критично (≤3 дней)
            </div>
            {reminders.critical.map(inc => (
              <div
                key={inc.id}
                onClick={() => onIncidentClick(inc)}
                className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-md cursor-pointer hover:bg-red-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{inc.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getOrganizationName(inc.organizationId)} • {getDirectionName(inc.directionId)}
                    </div>
                  </div>
                  <Badge variant="destructive" className="shrink-0">
                    {inc.daysLeft} {inc.daysLeft === 1 ? 'день' : 'дня'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {reminders.warning.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-orange-600 flex items-center gap-1">
              <Icon name="Clock" size={14} />
              Скоро истекает (4-7 дней)
            </div>
            {reminders.warning.map(inc => (
              <div
                key={inc.id}
                onClick={() => onIncidentClick(inc)}
                className="p-3 bg-white dark:bg-slate-900 border border-orange-200 rounded-md cursor-pointer hover:bg-orange-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{inc.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getOrganizationName(inc.organizationId)} • {getDirectionName(inc.directionId)}
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0 border-orange-300 text-orange-700">
                    {inc.daysLeft} дней
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}