import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface TopDirectionsChartProps {
  data: Array<{
    name: string;
    count: number;
  }>;
}

export default function TopDirectionsChart({ data }: TopDirectionsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ТОП-10 направлений по количеству инцидентов</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" name="Количество" />
            </BarChart>
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
