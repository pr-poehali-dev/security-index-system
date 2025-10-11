import { useState, useMemo } from 'react';
import { useChecklistsStore } from '@/stores/checklistsStore';
import { useOrganizationsStore } from '@/stores/organizationsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { Audit } from '@/types';

export default function AuditHistoryTab() {
  const { audits, checklists } = useChecklistsStore();
  const { organizations } = useOrganizationsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [organizationFilter, setOrganizationFilter] = useState<string>('all');
  const [checklistFilter, setChecklistFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateeTo] = useState('');

  const filteredAudits = useMemo(() => {
    return audits.filter(audit => {
      const checklist = checklists.find(c => c.id === audit.checklistId);
      const organization = organizations.find(o => o.id === audit.organizationId);

      const matchesSearch = 
        checklist?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        organization?.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || audit.status === statusFilter;
      const matchesOrganization = organizationFilter === 'all' || audit.organizationId === organizationFilter;
      const matchesChecklist = checklistFilter === 'all' || audit.checklistId === checklistFilter;

      const matchesDateFrom = !dateFrom || new Date(audit.scheduledDate) >= new Date(dateFrom);
      const matchesDateTo = !dateTo || new Date(audit.scheduledDate) <= new Date(dateTo);

      return matchesSearch && matchesStatus && matchesOrganization && matchesChecklist && matchesDateFrom && matchesDateTo;
    }).sort((a, b) => {
      const dateA = new Date(a.completedDate || a.scheduledDate);
      const dateB = new Date(b.completedDate || b.scheduledDate);
      return dateB.getTime() - dateA.getTime();
    });
  }, [audits, checklists, organizations, searchQuery, statusFilter, organizationFilter, checklistFilter, dateFrom, dateTo]);

  const getStatusColor = (status: Audit['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-100 text-green-700';
    }
  };

  const getStatusLabel = (status: Audit['status']) => {
    switch (status) {
      case 'scheduled': return 'Запланирован';
      case 'in_progress': return 'В процессе';
      case 'completed': return 'Завершен';
    }
  };

  const getPassRate = (audit: Audit) => {
    if (audit.findings.length === 0) return 0;
    const passed = audit.findings.filter(f => f.result === 'pass').length;
    return Math.round((passed / audit.findings.length) * 100);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setOrganizationFilter('all');
    setChecklistFilter('all');
    setDateFrom('');
    setDateeTo('');
  };

  const handlePrintReport = (audit: Audit) => {
    const checklist = checklists.find(c => c.id === audit.checklistId);
    const organization = organizations.find(o => o.id === audit.organizationId);
    const passRate = getPassRate(audit);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const passCount = audit.findings.filter(f => f.result === 'pass').length;
    const failCount = audit.findings.filter(f => f.result === 'fail').length;
    const naCount = audit.findings.filter(f => f.result === 'n/a').length;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="ru">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Отчет по аудиту - ${checklist?.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
          }
          .header h1 {
            font-size: 24px;
            margin-bottom: 10px;
            color: #1e40af;
          }
          .header p {
            color: #64748b;
            font-size: 14px;
          }
          .info-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
          }
          .info-item {
            padding: 15px;
            background: #f8fafc;
            border-left: 4px solid #2563eb;
            border-radius: 4px;
          }
          .info-item label {
            display: block;
            font-size: 12px;
            color: #64748b;
            margin-bottom: 5px;
            text-transform: uppercase;
            font-weight: 600;
          }
          .info-item value {
            display: block;
            font-size: 16px;
            color: #1e293b;
            font-weight: 500;
          }
          .summary {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .summary h2 {
            font-size: 18px;
            margin-bottom: 15px;
            color: #1e40af;
          }
          .stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
          }
          .stat-card {
            background: white;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .stat-card .value {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .stat-card .label {
            font-size: 12px;
            color: #64748b;
          }
          .stat-card.pass .value { color: #16a34a; }
          .stat-card.fail .value { color: #dc2626; }
          .stat-card.na .value { color: #64748b; }
          .stat-card.total .value { color: #2563eb; }
          .findings {
            margin-top: 30px;
          }
          .findings h2 {
            font-size: 18px;
            margin-bottom: 20px;
            color: #1e40af;
          }
          .finding-item {
            padding: 15px;
            margin-bottom: 15px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            page-break-inside: avoid;
          }
          .finding-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            gap: 10px;
          }
          .finding-title {
            flex: 1;
            font-weight: 600;
            font-size: 14px;
            color: #1e293b;
          }
          .result-badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }
          .result-badge.pass {
            background: #dcfce7;
            color: #166534;
          }
          .result-badge.fail {
            background: #fee2e2;
            color: #991b1b;
          }
          .result-badge.na {
            background: #f1f5f9;
            color: #475569;
          }
          .finding-comment {
            color: #64748b;
            font-size: 13px;
            padding-left: 15px;
            border-left: 3px solid #e2e8f0;
            margin-top: 8px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #94a3b8;
            font-size: 12px;
          }
          @media print {
            body { padding: 20px; }
            .info-section { page-break-inside: avoid; }
            .summary { page-break-inside: avoid; }
            .finding-item { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Отчет по аудиту</h1>
          <p>${checklist?.name}</p>
        </div>

        <div class="info-section">
          <div class="info-item">
            <label>Объект проверки</label>
            <value>${organization?.name || '-'}</value>
          </div>
          <div class="info-item">
            <label>Дата проведения</label>
            <value>${new Date(audit.scheduledDate).toLocaleDateString('ru-RU')}</value>
          </div>
          <div class="info-item">
            <label>Дата завершения</label>
            <value>${audit.completedDate ? new Date(audit.completedDate).toLocaleDateString('ru-RU') : '-'}</value>
          </div>
          <div class="info-item">
            <label>Аудитор</label>
            <value>${audit.auditorId}</value>
          </div>
        </div>

        <div class="summary">
          <h2>Общая информация</h2>
          <div class="stats">
            <div class="stat-card total">
              <div class="value">${passRate}%</div>
              <div class="label">Соответствие</div>
            </div>
            <div class="stat-card pass">
              <div class="value">${passCount}</div>
              <div class="label">Соответствует</div>
            </div>
            <div class="stat-card fail">
              <div class="value">${failCount}</div>
              <div class="label">Не соответствует</div>
            </div>
            <div class="stat-card na">
              <div class="value">${naCount}</div>
              <div class="label">Не применимо</div>
            </div>
          </div>
        </div>

        <div class="findings">
          <h2>Результаты проверки</h2>
          ${audit.findings.map(finding => {
            const item = checklist?.items.find(i => i.id === finding.itemId);
            const resultLabel = {
              pass: 'Соответствует',
              fail: 'Не соответствует',
              'n/a': 'Не применимо'
            }[finding.result];
            
            return `
              <div class="finding-item">
                <div class="finding-header">
                  <div class="finding-title">${item?.question || '-'}</div>
                  <span class="result-badge ${finding.result}">${resultLabel}</span>
                </div>
                ${finding.comment ? `<div class="finding-comment">${finding.comment}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <div class="footer">
          <p>Отчет сформирован автоматически ${new Date().toLocaleDateString('ru-RU')} в ${new Date().toLocaleTimeString('ru-RU')}</p>
        </div>

        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 250);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">История аудитов</h2>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="relative">
                <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Поиск по названию чек-листа или объекту..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Статус</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="scheduled">Запланирован</SelectItem>
                      <SelectItem value="in_progress">В процессе</SelectItem>
                      <SelectItem value="completed">Завершен</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Объект</Label>
                  <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все объекты</SelectItem>
                      {organizations.map(org => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Чек-лист</Label>
                  <Select value={checklistFilter} onValueChange={setChecklistFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все чек-листы</SelectItem>
                      {checklists.map(checklist => (
                        <SelectItem key={checklist.id} value={checklist.id}>
                          {checklist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Период</Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      placeholder="От"
                    />
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateeTo(e.target.value)}
                      placeholder="До"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-gray-600">
                  Найдено: <span className="font-medium">{filteredAudits.length}</span> из {audits.length}
                </p>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Сбросить фильтры
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {filteredAudits.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Icon name="Search" className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500">Аудиты не найдены</p>
              <p className="text-sm text-gray-400 mt-2">Попробуйте изменить параметры фильтрации</p>
            </CardContent>
          </Card>
        ) : (
          filteredAudits.map(audit => {
            const checklist = checklists.find(c => c.id === audit.checklistId);
            const organization = organizations.find(o => o.id === audit.organizationId);
            const passRate = getPassRate(audit);

            return (
              <Card key={audit.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{checklist?.name}</h3>
                        <Badge className={getStatusColor(audit.status)}>
                          {getStatusLabel(audit.status)}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <Icon name="Building2" size={14} />
                          <span>{organization?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="Calendar" size={14} />
                          <span>
                            Запланирован: {new Date(audit.scheduledDate).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                        {audit.completedDate && (
                          <div className="flex items-center gap-2">
                            <Icon name="CheckCircle2" size={14} className="text-green-600" />
                            <span>
                              Завершен: {new Date(audit.completedDate).toLocaleDateString('ru-RU')}
                            </span>
                          </div>
                        )}
                      </div>

                      {audit.status === 'completed' && audit.findings.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="p-2 bg-green-50 rounded text-center">
                            <p className="text-xs text-gray-600 mb-1">Соответствует</p>
                            <p className="font-bold text-green-700">
                              {audit.findings.filter(f => f.result === 'pass').length}
                            </p>
                          </div>
                          <div className="p-2 bg-red-50 rounded text-center">
                            <p className="text-xs text-gray-600 mb-1">Не соответствует</p>
                            <p className="font-bold text-red-700">
                              {audit.findings.filter(f => f.result === 'fail').length}
                            </p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded text-center">
                            <p className="text-xs text-gray-600 mb-1">Не применимо</p>
                            <p className="font-bold text-gray-700">
                              {audit.findings.filter(f => f.result === 'n/a').length}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {audit.status === 'completed' && (
                      <div className="text-right ml-6">
                        <div className="text-3xl font-bold mb-1">{passRate}%</div>
                        <p className="text-xs text-gray-600">соответствие</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Icon name="Eye" size={14} />
                      Просмотр
                    </Button>
                    {audit.status === 'completed' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={() => handlePrintReport(audit)}
                      >
                        <Icon name="Printer" size={14} />
                        Печать отчета
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}