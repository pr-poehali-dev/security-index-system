import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import type { ObjectDocument } from '@/types/catalog';

interface ObjectWizardDocumentsTabProps {
  documents: ObjectDocument[];
  onChange: (documents: ObjectDocument[]) => void;
}

interface DocumentSection {
  type: ObjectDocument['type'];
  title: string;
  required?: boolean;
  showRtnRegistration?: boolean;
  showExpiryDate?: boolean;
}

const DOCUMENT_SECTIONS: DocumentSection[] = [
  {
    type: 'commissioning',
    title: 'Документ, подтверждающий ввод объекта в эксплуатацию',
    required: true,
  },
  {
    type: 'safety_declaration',
    title: 'Декларация промышленной безопасности',
    required: false,
  },
  {
    type: 'expertise',
    title: 'Заключение экспертизы промышленной безопасности (ЭПБ)',
    required: false,
    showRtnRegistration: true,
    showExpiryDate: true,
  },
  {
    type: 'diagnostic_report',
    title: 'Отчет о техническом диагностировании',
    required: false,
  },
  {
    type: 'passport',
    title: 'Паспорт объекта',
    required: false,
  },
  {
    type: 'manual',
    title: 'Руководство по эксплуатации',
    required: false,
  },
  {
    type: 'instructions',
    title: 'Инструкции',
    required: false,
  },
  {
    type: 'other',
    title: 'Прочие',
    required: false,
  },
];

export default function ObjectWizardDocumentsTab({ documents, onChange }: ObjectWizardDocumentsTabProps) {
  const [fileInputs, setFileInputs] = useState<{ [key: string]: File | null }>({});

  const getDocumentByType = (type: ObjectDocument['type']) => {
    return documents.find(doc => doc.type === type);
  };

  const handleFileSelect = (type: ObjectDocument['type'], file: File | null) => {
    setFileInputs(prev => ({ ...prev, [type]: file }));
    
    if (file) {
      const existing = getDocumentByType(type);
      const updatedDoc: ObjectDocument = {
        id: existing?.id || crypto.randomUUID(),
        objectId: existing?.objectId || '',
        type,
        title: file.name,
        fileName: file.name,
        fileSize: file.size,
        fileUrl: URL.createObjectURL(file),
        createdAt: existing?.createdAt || new Date().toISOString(),
        documentNumber: existing?.documentNumber,
        issueDate: existing?.issueDate,
        expiryDate: existing?.expiryDate,
        rtnRegistrationNumber: existing?.rtnRegistrationNumber,
        operationExtendedUntil: existing?.operationExtendedUntil,
      };

      if (existing) {
        onChange(documents.map(doc => doc.type === type ? updatedDoc : doc));
      } else {
        onChange([...documents, updatedDoc]);
      }
    } else {
      onChange(documents.filter(doc => doc.type !== type));
      setFileInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[type];
        return newInputs;
      });
    }
  };

  const handleFieldChange = (
    type: ObjectDocument['type'],
    field: keyof ObjectDocument,
    value: string
  ) => {
    const existing = getDocumentByType(type);
    if (!existing) return;

    const updatedDoc = { ...existing, [field]: value };
    onChange(documents.map(doc => doc.type === type ? updatedDoc : doc));
  };

  return (
    <div className="space-y-4">
      {DOCUMENT_SECTIONS.map((section) => {
        const doc = getDocumentByType(section.type);
        const file = fileInputs[section.type];

        return (
          <Card key={section.type}>
            <CardContent className="p-6">
              <div className="flex items-start gap-2 mb-4">
                <h3 className="font-semibold flex-1">
                  {section.title}
                  {section.required && <span className="text-destructive ml-1">*</span>}
                </h3>
                {!section.required && (
                  <span className="text-xs text-muted-foreground">(при необходимости)</span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor={`file-${section.type}`}>Файл документа</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id={`file-${section.type}`}
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileSelect(section.type, e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    {(file || doc) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleFileSelect(section.type, null)}
                      >
                        <Icon name="X" size={18} />
                      </Button>
                    )}
                  </div>
                  {(file || doc) && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Icon name="FileText" size={16} />
                      <span>{file?.name || doc?.fileName}</span>
                      <span>({((file?.size || doc?.fileSize || 0) / 1024).toFixed(1)} КБ)</span>
                    </div>
                  )}
                </div>

                {(file || doc) && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`number-${section.type}`}>Номер документа</Label>
                        <Input
                          id={`number-${section.type}`}
                          type="text"
                          value={doc?.documentNumber || ''}
                          onChange={(e) => handleFieldChange(section.type, 'documentNumber', e.target.value)}
                          placeholder="Введите номер"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`date-${section.type}`}>Дата документа</Label>
                        <Input
                          id={`date-${section.type}`}
                          type="date"
                          value={doc?.issueDate || ''}
                          onChange={(e) => handleFieldChange(section.type, 'issueDate', e.target.value)}
                        />
                      </div>
                    </div>

                    {section.showRtnRegistration && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                          <Label htmlFor={`rtn-${section.type}`}>
                            Номер регистрации ЭПБ в Ростехнадзоре
                          </Label>
                          <Input
                            id={`rtn-${section.type}`}
                            type="text"
                            value={doc?.rtnRegistrationNumber || ''}
                            onChange={(e) => handleFieldChange(section.type, 'rtnRegistrationNumber', e.target.value)}
                            placeholder="Введите номер регистрации"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`operation-${section.type}`}>
                            Срок продления эксплуатации
                          </Label>
                          <Input
                            id={`operation-${section.type}`}
                            type="date"
                            value={doc?.operationExtendedUntil || ''}
                            onChange={(e) => handleFieldChange(section.type, 'operationExtendedUntil', e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {section.showExpiryDate && !section.showRtnRegistration && (
                      <div>
                        <Label htmlFor={`expiry-${section.type}`}>Срок действия</Label>
                        <Input
                          id={`expiry-${section.type}`}
                          type="date"
                          value={doc?.expiryDate || ''}
                          onChange={(e) => handleFieldChange(section.type, 'expiryDate', e.target.value)}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
