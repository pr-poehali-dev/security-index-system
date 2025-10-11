import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import RiskMatrix from './RiskMatrix';
import type { Incident, Category } from '@/types';

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface TopDataItem {
  name: string;
  count: number;
}

interface MonthlyDataItem {
  month: string;
  'Всего': number;
  'Создано': number;
  'Исполнено': number;
  'Просрочено': number;
}

interface CumulativeDataItem {
  month: string;
  'Создано накопительно': number;
  'Исполнено накопительно': number;
  'Открытых инцидентов': number;
}

interface ReportChartsSectionProps {
  statusData: ChartDataItem[];
  timelineData: ChartDataItem[];
  monthlyDynamicsData: MonthlyDataItem[];
  cumulativeDynamicsData: CumulativeDataItem[];
  directionData: TopDataItem[];
  categoryData: TopDataItem[];
  organizationData: TopDataItem[];
  filteredIncidents: Incident[];
  categories: Category[];
}

export default function ReportChartsSection({
  statusData,
  timelineData,
  monthlyDynamicsData,
  cumulativeDynamicsData,
  directionData,
  categoryData,
  organizationData,
  filteredIncidents,
  categories
}: ReportChartsSectionProps) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Распределение по статусам</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Нет данных для отображения
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Выполнение по срокам</CardTitle>
          </CardHeader>
          <CardContent>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={timelineData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {timelineData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Нет данных для отображения
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Динамика инцидентов по месяцам</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyDynamicsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyDynamicsData}>
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
              Нет данных для отображения
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Накопительная динамика и баланс инцидентов</CardTitle>
        </CardHeader>
        <CardContent>
          {cumulativeDynamicsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={cumulativeDynamicsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Создано накопительно" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="Исполнено накопительно" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="Открытых инцидентов" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Нет данных для отображения
            </div>
          )}
        </CardContent>
      </Card>

      <RiskMatrix incidents={filteredIncidents} categories={categories} />

      <Card>
        <CardHeader>
          <CardTitle>Топ-10 направлений по количеству инцидентов</CardTitle>
        </CardHeader>
        <CardContent>
          {directionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={directionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" name="Количество инцидентов" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              Нет данных для отображения
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Топ-10 категорий по количеству инцидентов</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" name="Количество инцидентов" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Нет данных для отображения
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Топ-10 организаций по количеству инцидентов</CardTitle>
          </CardHeader>
          <CardContent>
            {organizationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={organizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" name="Количество инцидентов" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Нет данных для отображения
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
