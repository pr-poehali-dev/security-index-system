import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

interface ImportedCertification {
  employeeName: string;
  category: string;
  area: string;
  issueDate: string;
  expiryDate: string;
  protocolNumber?: string;
  protocolDate?: string;
  verified?: boolean;
  status: 'valid' | 'warning' | 'error';
  errors?: string[];
}

interface ImportCertificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ImportCertificationsDialog({ open, onOpenChange }: ImportCertificationsDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<ImportedCertification[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        toast({
          title: 'Ошибка',
          description: 'Поддерживаются только файлы Excel (.xlsx, .xls)',
          variant: 'destructive'
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const parseExcelFile = async () => {
    if (!file) return;

    setIsProcessing(true);

    setTimeout(() => {
      const mockData: ImportedCertification[] = [
        {
          employeeName: 'Иванов Иван Иванович',
          category: 'Промышленная безопасность',
          area: 'А.1 Основы промышленной безопасности',
          issueDate: '2023-01-01',
          expiryDate: '2028-01-01',
          protocolNumber: 'ПБ-123/2023',
          protocolDate: '2023-01-01',
          status: 'valid'
        },
        {
          employeeName: 'Иванов Иван Иванович',
          category: 'Промышленная безопасность',
          area: 'Б.3 Эксплуатация объектов электроэнергетики',
          issueDate: '2021-09-15',
          expiryDate: '2026-09-14',
          protocolNumber: 'ПБ-456/2021',
          protocolDate: '2021-09-15',
          status: 'valid'
        },
        {
          employeeName: 'Петрова Анна Сергеевна',
          category: 'Электробезопасность',
          area: 'V группа до 1000В',
          issueDate: '2024-06-15',
          expiryDate: '2025-06-15',
          status: 'valid'
        },
        {
          employeeName: 'Неизвестный сотрудник',
          category: 'Промышленная безопасность',
          area: 'А.1',
          issueDate: '2023-01-01',
          expiryDate: '2028-01-01',
          protocolNumber: 'ПБ-999/2023',
          status: 'error',
          errors: ['Сотрудник не найден в системе']
        },
        {
          employeeName: 'Сидоров Петр Николаевич',
          category: 'Работы на высоте',
          area: '2 группа',
          issueDate: '2025-01-01',
          expiryDate: '2024-12-31',
          status: 'warning',
          errors: ['Дата истечения раньше даты выдачи']
        }
      ];

      setImportData(mockData);
      setStep('preview');
      setIsProcessing(false);
      
      toast({
        title: 'Файл обработан',
        description: `Найдено ${mockData.length} записей для импорта`
      });
    }, 1500);
  };

  const handleImport = () => {
    setIsProcessing(true);

    const validRecords = importData.filter(item => item.status === 'valid' || item.status === 'warning');
    
    setTimeout(() => {
      setStep('complete');
      setIsProcessing(false);
      
      toast({
        title: 'Импорт завершен',
        description: `Успешно импортировано ${validRecords.length} аттестаций`
      });
    }, 1000);
  };

  const handleReset = () => {
    setFile(null);
    setImportData([]);
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    toast({
      title: 'Шаблон скачивается',
      description: 'Файл excel_template_certifications.xlsx начал загружаться'
    });
  };

  const validCount = importData.filter(i => i.status === 'valid').length;
  const warningCount = importData.filter(i => i.status === 'warning').length;
  const errorCount = importData.filter(i => i.status === 'error').length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Импорт аттестаций из Excel</DialogTitle>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6">
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Требования к файлу Excel
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Формат: .xlsx или .xls</li>
                      <li>• Первая строка — заголовки колонок</li>
                      <li>• Обязательные колонки: ФИО, Категория аттестации, Область аттестации, Дата выдачи, Дата истечения</li>
                      <li>• Дополнительные колонки: Номер протокола, Дата протокола (для ПБ и ЭБ)</li>
                      <li>• Даты в формате: ДД.ММ.ГГГГ или ГГГГ-ММ-ДД</li>
                      <li>• ФИО должно полностью совпадать с данными в системе</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <div>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={downloadTemplate}
                >
                  <Icon name="Download" size={18} />
                  Скачать шаблон Excel
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Используйте готовый шаблон для заполнения данных
                </p>
              </div>

              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="excel-file-input"
                />
                <label htmlFor="excel-file-input" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-full bg-primary/10">
                      <Icon name="Upload" size={32} className="text-primary" />
                    </div>
                    {file ? (
                      <>
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="FileSpreadsheet" size={16} />
                          <span className="font-medium">{file.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} КБ
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium">Нажмите для выбора файла</p>
                        <p className="text-sm text-muted-foreground">
                          или перетащите файл Excel сюда
                        </p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Icon name="CheckCircle2" className="text-emerald-600" size={24} />
                    <div>
                      <p className="text-2xl font-bold">{validCount}</p>
                      <p className="text-xs text-muted-foreground">Готовы к импорту</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Icon name="AlertTriangle" className="text-amber-600" size={24} />
                    <div>
                      <p className="text-2xl font-bold">{warningCount}</p>
                      <p className="text-xs text-muted-foreground">Предупреждения</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Icon name="XCircle" className="text-red-600" size={24} />
                    <div>
                      <p className="text-2xl font-bold">{errorCount}</p>
                      <p className="text-xs text-muted-foreground">Ошибки</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {importData.map((item, index) => (
                <Card key={index} className={
                  item.status === 'error' ? 'border-red-200 dark:border-red-900' :
                  item.status === 'warning' ? 'border-amber-200 dark:border-amber-900' : ''
                }>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Icon 
                        name={
                          item.status === 'valid' ? 'CheckCircle2' :
                          item.status === 'warning' ? 'AlertTriangle' : 'XCircle'
                        } 
                        size={20}
                        className={
                          item.status === 'valid' ? 'text-emerald-600' :
                          item.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-medium">{item.employeeName}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                            item.status === 'valid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            item.status === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {item.status === 'valid' ? 'Готово' : item.status === 'warning' ? 'Предупреждение' : 'Ошибка'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                        <p className="text-xs text-muted-foreground">{item.area}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Выдана: {new Date(item.issueDate).toLocaleDateString('ru')}</span>
                          <span>До: {new Date(item.expiryDate).toLocaleDateString('ru')}</span>
                          {item.protocolNumber && (
                            <span>Протокол: {item.protocolNumber}</span>
                          )}
                        </div>
                        {item.errors && item.errors.length > 0 && (
                          <div className="mt-2 p-2 rounded bg-red-50 dark:bg-red-950/20">
                            {item.errors.map((error, i) => (
                              <p key={i} className="text-xs text-red-600 dark:text-red-400">
                                • {error}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {errorCount > 0 && (
              <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon name="AlertCircle" size={20} className="text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                        Обнаружены ошибки
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Записи с ошибками не будут импортированы. Исправьте ошибки в файле и загрузите повторно.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {step === 'complete' && (
          <div className="py-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <Icon name="CheckCircle2" size={48} className="text-emerald-600" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Импорт успешно завершен!</h3>
              <p className="text-muted-foreground">
                Импортировано {validCount + warningCount} аттестаций
              </p>
            </div>
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-left">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Что дальше?
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Проверьте импортированные данные в реестре сотрудников. При необходимости 
                      вы можете отредактировать информацию вручную.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          {step === 'upload' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Отмена
              </Button>
              <Button 
                onClick={parseExcelFile} 
                disabled={!file || isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <Icon name="Upload" size={16} />
                    Загрузить и проверить
                  </>
                )}
              </Button>
            </>
          )}

          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={handleReset}>
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                Выбрать другой файл
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={isProcessing || validCount + warningCount === 0}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Icon name="Loader2" size={16} className="animate-spin" />
                    Импорт...
                  </>
                ) : (
                  <>
                    <Icon name="Check" size={16} />
                    Импортировать ({validCount + warningCount})
                  </>
                )}
              </Button>
            </>
          )}

          {step === 'complete' && (
            <Button onClick={handleClose} className="gap-2">
              <Icon name="Check" size={16} />
              Готово
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}