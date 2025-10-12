import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { ROUTES } from '@/lib/constants';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        const loggedUser = useAuthStore.getState().user;
        if (loggedUser?.role === 'SuperAdmin') {
          navigate(ROUTES.TENANTS);
        } else {
          navigate(ROUTES.DASHBOARD);
        }
      } else {
        setError('Неверный email или пароль');
      }
    } catch {
      setError('Ошибка входа в систему');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Icon name="Shield" className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Индекс Безопасности</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Система управления промышленной безопасностью</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Icon name="Users" className="text-emerald-600 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Мультитенантная архитектура</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Управление несколькими организациями в одной системе</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Icon name="GraduationCap" className="text-emerald-600 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Аттестация персонала</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Контроль сроков, интеграция с Ростехнадзором</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Icon name="BarChart3" className="text-emerald-600 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Аналитика и отчеты</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Матрицы компетенций, gap-анализ, статистика</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>Вход в систему</CardTitle>
            <CardDescription>Введите ваши учетные данные</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.ru"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <Icon name="AlertCircle" size={16} />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                    Вход...
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" className="mr-2" size={16} />
                    Войти
                  </>
                )}
              </Button>


            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}