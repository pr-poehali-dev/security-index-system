import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface DocumentViewerDialogProps {
  documentUrl: string | null;
  onClose: () => void;
}

export default function DocumentViewerDialog({
  documentUrl,
  onClose
}: DocumentViewerDialogProps) {
  return (
    <Dialog open={!!documentUrl} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Просмотр документа</DialogTitle>
        </DialogHeader>
        <div className="w-full h-[70vh] flex items-center justify-center bg-muted rounded-lg overflow-hidden">
          {documentUrl && (
            documentUrl.startsWith('data:') ? (
              <img 
                src={documentUrl} 
                alt="Документ" 
                className="max-w-full max-h-full object-contain"
              />
            ) : documentUrl.endsWith('.pdf') ? (
              <iframe 
                src={documentUrl} 
                className="w-full h-full"
                title="PDF документ"
              />
            ) : (
              <div className="text-center">
                <Icon name="FileText" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Не удалось загрузить документ</p>
                <Button 
                  className="mt-4" 
                  onClick={() => window.open(documentUrl, '_blank')}
                >
                  Открыть в новой вкладке
                </Button>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
