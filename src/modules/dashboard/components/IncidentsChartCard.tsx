import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import ReportPeriodSelector from '@/components/dashboard/ReportPeriodSelector';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ReportPeriod } from '@/utils/reportGenerator';

class ChartErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.warn('Chart error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
          <Icon name="BarChart3" size={16} className="mr-2 opacity-50" />
          Не удалось отобразить график
        </div>
      );
    }
    return this.props.children;
  }
}

interface IncidentsChartCardProps {
  data: Array<{
    date: string;
    'Создано': number;
    'В работе': number;
    'Просрочено': number;
    'Исполнено': number;
  }>;
  onGenerateReport: (period: ReportPeriod) => Promise<void>;
}

export default function IncidentsChartCard({ data, onGenerateReport }: IncidentsChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon name="BarChart3" size={20} className="text-red-600" />
            Инциденты по приоритетам за 30 дней
          </CardTitle>
          <ReportPeriodSelector 
            onGenerateReport={onGenerateReport}
            variant="ghost"
            size="sm"
            showLabel={false}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ChartErrorBoundary>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }} 
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis 
                  tick={{ fontSize: 12 }} 
                  className="text-gray-600 dark:text-gray-400"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="Создано" stackId="a" fill="#3b82f6" />
                <Bar dataKey="В работе" stackId="a" fill="#f97316" />
                <Bar dataKey="Просрочено" stackId="a" fill="#ef4444" />
                <Bar dataKey="Исполнено" stackId="a" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartErrorBoundary>
      </CardContent>
    </Card>
  );
}
