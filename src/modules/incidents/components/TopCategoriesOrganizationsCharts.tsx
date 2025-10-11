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

interface TopCategoriesOrganizationsChartsProps {
  categoriesData: Array<{
    name: string;
    count: number;
  }>;
  organizationsData: Array<{
    name: string;
    count: number;
  }>;
}

export default function TopCategoriesOrganizationsCharts({
  categoriesData,
  organizationsData
}: TopCategoriesOrganizationsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>ТОП-10 категорий инцидентов</CardTitle>
        </CardHeader>
        <CardContent>
          {categoriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={categoriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" name="Количество" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Нет данных
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ТОП-10 организаций</CardTitle>
        </CardHeader>
        <CardContent>
          {organizationsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={organizationsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" name="Количество" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Нет данных
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
