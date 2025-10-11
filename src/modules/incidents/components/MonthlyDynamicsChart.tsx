import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyDynamicsChartProps {
  data: Array<{
    month: string;
    'Всего': number;
    'Создано': number;
    'Исполнено': number;
    'Просрочено': number;
  }>;
}

export default function MonthlyDynamicsChart({ data }: MonthlyDynamicsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Динамика инцидентов по месяцам (последние 12 мес.)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Всего" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="Создано" stroke="#8b5cf6" strokeWidth={2} />
              <Line type="monotone" dataKey="Исполнено" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="Просрочено" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Нет данных
          </div>
        )}
      </CardContent>
    </Card>
  );
}
