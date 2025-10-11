import { useState, useEffect } from 'react';
import { useChecklistsStore } from '@/stores/checklistsStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import SignaturePad from '@/components/ui/signature-pad';
import Icon from '@/components/ui/icon';
import type { Audit, ChecklistItem } from '@/types';

interface AuditDialogProps {
  open: boolean;
  onClose: () => void;
  audit: Audit;
}

type FindingResult = 'pass' | 'fail' | 'n/a';

interface ItemResponse {
  itemId: string;
  result: FindingResult | null;
  comment: string;
  photo?: string;
}

export default function AuditDialog({ open, onClose, audit }: AuditDialogProps) {
  const { checklists, updateAuditFindings, completeAudit } = useChecklistsStore();
  const checklist = checklists.find(c => c.id === audit.checklistId);
  
  const [responses, setResponses] = useState<ItemResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSignature, setShowSignature] = useState(false);
  const [signature, setSignature] = useState<string | undefined>(audit.auditorSignature);

  useEffect(() => {
    if (checklist && open) {
      const initialResponses = checklist.items.map(item => ({
        itemId: item.id,
        result: audit.findings.find(f => f.itemId === item.id)?.result || null,
        comment: audit.findings.find(f => f.itemId === item.id)?.comment || '',
        photo: audit.findings.find(f => f.itemId === item.id)?.photo
      }));
      setResponses(initialResponses);
      setCurrentIndex(0);
    }
  }, [checklist, audit, open]);

  if (!checklist) return null;

  const currentItem = checklist.items[currentIndex];
  const currentResponse = responses[currentIndex];
  const progress = ((currentIndex + 1) / checklist.items.length) * 100;
  const answeredCount = responses.filter(r => r.result !== null).length;

  const updateResponse = (updates: Partial<ItemResponse>) => {
    setResponses(responses.map((r, i) => 
      i === currentIndex ? { ...r, ...updates } : r
    ));
  };

  const handleNext = () => {
    if (currentIndex < checklist.items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateResponse({ photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    updateResponse({ photo: undefined });
  };

  const handleSave = () => {
    const findings = responses
      .filter(r => r.result !== null)
      .map((r, index) => ({
        id: `finding-${Date.now()}-${index}`,
        itemId: r.itemId,
        result: r.result!,
        comment: r.comment || undefined,
        photo: r.photo
      }));

    updateAuditFindings(audit.id, findings);
    onClose();
  };

  const handleComplete = () => {
    if (!canComplete) return;
    setShowSignature(true);
  };

  const handleFinalizeAudit = () => {
    const findings = responses
      .filter(r => r.result !== null)
      .map((r, index) => ({
        id: `finding-${Date.now()}-${index}`,
        itemId: r.itemId,
        result: r.result!,
        comment: r.comment || undefined,
        photo: r.photo
      }));

    updateAuditFindings(audit.id, findings);
    completeAudit(audit.id);
    onClose();
  };

  const canComplete = responses.every(r => r.result !== null);

  if (showSignature) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Подпись аудитора</DialogTitle>
            <DialogDescription>
              Подпишите акт проверки для завершения аудита
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {signature ? (
              <div className="space-y-4">
                <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
                  <img src={signature} alt="Подпись аудитора" className="w-full" />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSignature(undefined)}
                    className="flex-1"
                  >
                    Изменить подпись
                  </Button>
                  <Button
                    onClick={handleFinalizeAudit}
                    className="flex-1 gap-2"
                  >
                    <Icon name="CheckCircle" size={16} />
                    Завершить аудит
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Label className="mb-2 block">Распишитесь в поле ниже</Label>
                <SignaturePad
                  onSave={(sig) => setSignature(sig)}
                  onClear={() => setSignature(undefined)}
                />
              </>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setShowSignature(false)}>
              Назад к проверке
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{checklist.name}</DialogTitle>
          <DialogDescription>
            Проведение аудита • Вопрос {currentIndex + 1} из {checklist.items.length}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Прогресс</span>
              <span className="font-medium">{answeredCount} / {checklist.items.length}</span>
            </div>
            <Progress value={progress} />
          </div>

          <Card className={currentItem.criticalItem ? 'border-red-300' : ''}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Icon 
                    name={currentItem.criticalItem ? "AlertCircle" : "Circle"} 
                    className={currentItem.criticalItem ? "text-red-500 mt-1" : "text-gray-400 mt-1"}
                    size={20}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Вопрос {currentIndex + 1}
                      </span>
                      {currentItem.criticalItem && (
                        <Badge variant="destructive" className="text-xs">
                          Критичный
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-medium mb-4">{currentItem.question}</h3>

                    <div className="space-y-3">
                      <Label>Результат проверки</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={currentResponse?.result === 'pass' ? 'default' : 'outline'}
                          className={
                            currentResponse?.result === 'pass'
                              ? 'bg-green-600 hover:bg-green-700 flex-1'
                              : 'flex-1'
                          }
                          onClick={() => updateResponse({ result: 'pass' })}
                        >
                          <Icon name="Check" size={18} className="mr-2" />
                          Соответствует
                        </Button>
                        <Button
                          variant={currentResponse?.result === 'fail' ? 'default' : 'outline'}
                          className={
                            currentResponse?.result === 'fail'
                              ? 'bg-red-600 hover:bg-red-700 flex-1'
                              : 'flex-1'
                          }
                          onClick={() => updateResponse({ result: 'fail' })}
                        >
                          <Icon name="X" size={18} className="mr-2" />
                          Не соответствует
                        </Button>
                        <Button
                          variant={currentResponse?.result === 'n/a' ? 'default' : 'outline'}
                          className={
                            currentResponse?.result === 'n/a'
                              ? 'bg-gray-600 hover:bg-gray-700'
                              : ''
                          }
                          onClick={() => updateResponse({ result: 'n/a' })}
                        >
                          <Icon name="Minus" size={18} className="mr-2" />
                          Н/П
                        </Button>
                      </div>

                      {(currentItem.requiresComment || currentResponse?.result === 'fail') && (
                        <div className="space-y-2">
                          <Label htmlFor="comment">
                            Комментарий
                            {currentResponse?.result === 'fail' && (
                              <span className="text-red-600 ml-1">*</span>
                            )}
                          </Label>
                          <Textarea
                            id="comment"
                            placeholder="Добавьте комментарий или описание проблемы..."
                            value={currentResponse?.comment || ''}
                            onChange={(e) => updateResponse({ comment: e.target.value })}
                            rows={3}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Фото-фиксация (опционально)</Label>
                        {currentResponse?.photo ? (
                          <div className="relative">
                            <img 
                              src={currentResponse.photo} 
                              alt="Фото находки" 
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2"
                              onClick={handleRemovePhoto}
                            >
                              <Icon name="X" size={14} className="mr-1" />
                              Удалить
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                              id="photo-upload"
                            />
                            <label htmlFor="photo-upload" className="cursor-pointer">
                              <Icon name="Camera" className="mx-auto mb-2 text-gray-400" size={32} />
                              <p className="text-sm text-gray-600">Нажмите для загрузки фото</p>
                              <p className="text-xs text-gray-400 mt-1">JPG, PNG до 5MB</p>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="gap-2"
            >
              <Icon name="ChevronLeft" size={16} />
              Назад
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSave}>
                Сохранить черновик
              </Button>
              
              {currentIndex === checklist.items.length - 1 ? (
                <Button 
                  onClick={handleComplete}
                  disabled={!canComplete}
                  className="gap-2"
                >
                  <Icon name="CheckCircle" size={16} />
                  Завершить аудит
                </Button>
              ) : (
                <Button 
                  onClick={handleNext}
                  disabled={!currentResponse?.result}
                  className="gap-2"
                >
                  Далее
                  <Icon name="ChevronRight" size={16} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}