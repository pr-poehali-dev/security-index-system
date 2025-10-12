import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import type { CompetencyDir } from '@/types';

interface CertificationForm {
  competencyId: string;
  issueDate: string;
  expiryDate: string;
  protocolNumber: string;
  issuedBy: string;
}

interface CertificationsTabProps {
  certifications: CertificationForm[];
  tenantCompetencies: CompetencyDir[];
  onAddCertification: () => void;
  onRemoveCertification: (index: number) => void;
  onUpdateCertification: (index: number, field: keyof CertificationForm, value: string) => void;
}

export default function CertificationsTab({
  certifications,
  tenantCompetencies,
  onAddCertification,
  onRemoveCertification,
  onUpdateCertification
}: CertificationsTabProps) {
  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">Аттестации сотрудника</h4>
          <p className="text-sm text-muted-foreground">Добавьте аттестации по областям</p>
        </div>
        <Button type="button" size="sm" onClick={onAddCertification}>
          <Icon name="Plus" className="mr-2 h-4 w-4" />
          Добавить
        </Button>
      </div>

      {certifications.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Нет аттестаций. Нажмите "Добавить" для создания.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {certifications.map((cert, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Аттестация #{index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveCertification(index)}
                  >
                    <Icon name="Trash2" className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Область аттестации</Label>
                  <Select
                    value={cert.competencyId}
                    onValueChange={(value) => onUpdateCertification(index, 'competencyId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите область" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenantCompetencies.map((comp) => (
                        <SelectItem key={comp.id} value={comp.id}>
                          {comp.code} — {comp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Дата аттестации</Label>
                    <Input
                      type="date"
                      value={cert.issueDate}
                      onChange={(e) => onUpdateCertification(index, 'issueDate', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Срок окончания</Label>
                    <Input
                      type="date"
                      value={cert.expiryDate}
                      onChange={(e) => onUpdateCertification(index, 'expiryDate', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Номер протокола</Label>
                    <Input
                      value={cert.protocolNumber}
                      onChange={(e) => onUpdateCertification(index, 'protocolNumber', e.target.value)}
                      placeholder="№ 123/2024"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Кем выдано</Label>
                    <Input
                      value={cert.issuedBy}
                      onChange={(e) => onUpdateCertification(index, 'issuedBy', e.target.value)}
                      placeholder="Ростехнадзор"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
