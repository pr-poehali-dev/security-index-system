import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

export default function PlatformNewsTab() {
  const news = [
    {
      id: '1',
      title: 'Обновление платформы v2.5.0',
      description: 'Добавлена поддержка новых модулей аттестации, улучшена производительность и исправлены критические ошибки.',
      date: '15 октября 2024',
      type: 'update',
      badges: ['Важно', 'Обновление']
    },
    {
      id: '2',
      title: 'Новый модуль "Учебный центр"',
      description: 'Теперь доступен модуль для управления обучением персонала с интеграцией систем дистанционного обучения.',
      date: '10 октября 2024',
      type: 'feature',
      badges: ['Новая функция']
    },
    {
      id: '3',
      title: 'Плановые технические работы',
      description: 'С 20 по 21 октября будут проводиться плановые технические работы. Возможны кратковременные перебои в работе.',
      date: '8 октября 2024',
      type: 'maintenance',
      badges: ['Техработы']
    },
    {
      id: '4',
      title: 'Улучшение системы отчетности',
      description: 'Добавлены новые шаблоны отчетов и возможность экспорта в различные форматы.',
      date: '1 октября 2024',
      type: 'improvement',
      badges: ['Улучшение']
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'update': return 'RefreshCw';
      case 'feature': return 'Sparkles';
      case 'maintenance': return 'Wrench';
      case 'improvement': return 'TrendingUp';
      default: return 'Bell';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'update': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600';
      case 'feature': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600';
      case 'maintenance': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-600';
      case 'improvement': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600';
      default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Новости платформы</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Обновления, новые функции и важные объявления
              </p>
            </div>
            <Button variant="outline">
              <Icon name="Rss" className="mr-2" size={16} />
              Подписаться
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {news.map((item) => (
              <div
                key={item.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getTypeColor(item.type)}`}>
                    <Icon name={getTypeIcon(item.type) as any} size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          {item.badges.map((badge) => (
                            <Badge key={badge} variant="secondary" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {item.date}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {item.description}
                    </p>
                    <Button variant="ghost" size="sm">
                      Подробнее
                      <Icon name="ChevronRight" className="ml-1" size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Icon name="BookOpen" className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Документация</p>
                <Button variant="link" className="h-auto p-0 text-blue-600">
                  Перейти
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                <Icon name="MessageCircle" className="text-emerald-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Поддержка</p>
                <Button variant="link" className="h-auto p-0 text-emerald-600">
                  Связаться
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Icon name="Lightbulb" className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Идеи</p>
                <Button variant="link" className="h-auto p-0 text-purple-600">
                  Предложить
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
