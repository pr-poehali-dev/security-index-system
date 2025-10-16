import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Certification {
  id: string;
  employeeName: string;
  employeePosition: string;
  department: string;
  category: string;
  area: string;
  expiryDate: string;
  status: 'valid' | 'expiring_soon' | 'expired';
  daysLeft: number;
  type?: 'certification' | 'qualification';
}

interface UpcomingCertificationsListProps {
  certifications: Certification[];
}

export default function UpcomingCertificationsList({ certifications }: UpcomingCertificationsListProps) {
  const qualificationCerts = certifications.filter(c => c.type === 'qualification');
  const regularCerts = certifications.filter(c => c.type !== 'qualification');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="Calendar" size={20} />
          Ближайшие сроки (90 дней)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {certifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Icon name="Calendar" size={48} className="mx-auto mb-2 opacity-20" />
            <p>Нет событий в ближайшие 90 дней</p>
          </div>
        ) : (
          <div className="space-y-4">
            {qualificationCerts.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <Icon name="GraduationCap" size={16} />
                  Удостоверения повышения квалификации ({qualificationCerts.length})
                </h3>
                <div className="space-y-2">
                  {qualificationCerts.map(cert => (
                    <div
                      key={cert.id}
                      className={`p-4 rounded-lg border flex items-start justify-between gap-4 ${
                        cert.status === 'expired'
                          ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                          : cert.status === 'expiring_soon'
                          ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900'
                          : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon name="Award" size={14} className="text-purple-600" />
                          <p className="font-medium">{cert.employeeName}</p>
                          <Badge variant="outline" className="text-xs">
                            {cert.employeePosition}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{cert.area}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon name="Building2" size={12} />
                            {cert.department}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium mb-1">
                          {new Date(cert.expiryDate).toLocaleDateString('ru-RU')}
                        </p>
                        <Badge
                          variant={
                            cert.status === 'expired'
                              ? 'destructive'
                              : cert.status === 'expiring_soon'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {cert.daysLeft > 0 ? `${cert.daysLeft} дн.` : `${Math.abs(cert.daysLeft)} дн. назад`}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {regularCerts.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Icon name="FileCheck" size={16} />
                  Аттестации ({regularCerts.length})
                </h3>
                <div className="space-y-2">
                  {regularCerts.map(cert => (
                    <div
                      key={cert.id}
                      className={`p-4 rounded-lg border flex items-start justify-between gap-4 ${
                        cert.status === 'expired'
                          ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
                          : cert.status === 'expiring_soon'
                          ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900'
                          : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{cert.employeeName}</p>
                          <Badge variant="outline" className="text-xs">
                            {cert.employeePosition}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{cert.area}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon name="Building2" size={12} />
                            {cert.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Tag" size={12} />
                            {cert.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium mb-1">
                          {new Date(cert.expiryDate).toLocaleDateString('ru-RU')}
                        </p>
                        <Badge
                          variant={
                            cert.status === 'expired'
                              ? 'destructive'
                              : cert.status === 'expiring_soon'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {cert.daysLeft > 0 ? `${cert.daysLeft} дн.` : `${Math.abs(cert.daysLeft)} дн. назад`}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}