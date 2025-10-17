import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useDpoQualificationStore } from '@/stores/dpoQualificationStore';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface QualificationCertificatesListProps {
  employeeId: string;
}

export default function QualificationCertificatesList({ employeeId }: QualificationCertificatesListProps) {
  const certificates = useDpoQualificationStore((state) => 
    state.getQualificationsByPersonnel(employeeId)
  );
  const deleteQualification = useDpoQualificationStore((state) => state.deleteQualification);
  
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getStatusBadge = (expiryDate: string) => {
    const daysLeft = getDaysUntilExpiry(expiryDate);
    if (daysLeft < 0) {
      return <Badge variant="destructive">Просрочено</Badge>;
    } else if (daysLeft <= 30) {
      return <Badge className="bg-amber-500">Истекает</Badge>;
    } else {
      return <Badge className="bg-green-500">Действует</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const days = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };



  const handleDelete = async () => {
    if (deleteId) {
      await deleteQualification(deleteId);
      setDeleteId(null);
    }
  };



  if (certificates.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-50" />
            <p>Удостоверений повышения квалификации не найдено</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Award" size={20} />
            Удостоверения повышения квалификации
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Область аттестации</TableHead>
                <TableHead>Номер</TableHead>
                <TableHead>Дата выдачи</TableHead>
                <TableHead>Срок действия</TableHead>
                <TableHead>Учебный центр</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.map((cert) => {
                const daysLeft = getDaysUntilExpiry(cert.expiryDate);
                const firstDoc = cert.documents && cert.documents[0];
                return (
                  <TableRow key={cert.id}>
                    <TableCell>
                      <div className="text-sm">
                        {cert.programName}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{cert.certificateNumber}</TableCell>
                    <TableCell>{formatDate(cert.issueDate)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{formatDate(cert.expiryDate)}</span>
                        {daysLeft > 0 && daysLeft <= 30 && (
                          <span className="text-xs text-amber-600">
                            Осталось {daysLeft} дн.
                          </span>
                        )}
                        {daysLeft < 0 && (
                          <span className="text-xs text-red-600">
                            Просрочено на {Math.abs(daysLeft)} дн.
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{cert.trainingOrganizationName}</TableCell>
                    <TableCell>{getStatusBadge(cert.expiryDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {firstDoc && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(firstDoc.fileUrl, '_blank')}
                          >
                            <Icon name="Eye" size={16} />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(cert.id)}
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {certificates.some(c => c.notes) && (
            <div className="mt-4 space-y-2">
              {certificates
                .filter(c => c.notes)
                .map(cert => (
                  <div key={cert.id} className="text-sm bg-muted p-3 rounded">
                    <span className="font-medium">{cert.certificateNumber}:</span> {cert.notes}
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить удостоверение?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Удостоверение будет удалено из системы.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}