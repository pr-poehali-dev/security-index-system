import type { Audit, Checklist, Organization } from '@/types';

export function generateAuditReport(
  audit: Audit,
  checklist: Checklist | undefined,
  organization: Organization | undefined
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const passCount = audit.findings.filter(f => f.result === 'pass').length;
  const failCount = audit.findings.filter(f => f.result === 'fail').length;
  const naCount = audit.findings.filter(f => f.result === 'n/a').length;
  const passRate = audit.findings.length === 0 
    ? 0 
    : Math.round((passCount / audit.findings.length) * 100);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Отчет по аудиту - ${checklist?.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          padding: 40px;
          color: #333;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #2563eb;
        }
        .header h1 {
          font-size: 24px;
          margin-bottom: 10px;
          color: #1e40af;
        }
        .header p {
          color: #64748b;
          font-size: 14px;
        }
        .info-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        .info-item {
          padding: 15px;
          background: #f8fafc;
          border-left: 4px solid #2563eb;
          border-radius: 4px;
        }
        .info-item label {
          display: block;
          font-size: 12px;
          color: #64748b;
          margin-bottom: 5px;
          text-transform: uppercase;
          font-weight: 600;
        }
        .info-item value {
          display: block;
          font-size: 16px;
          color: #1e293b;
          font-weight: 500;
        }
        .summary {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .summary h2 {
          font-size: 18px;
          margin-bottom: 15px;
          color: #1e40af;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        .stat-card {
          background: white;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .stat-card .value {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .stat-card .label {
          font-size: 12px;
          color: #64748b;
        }
        .stat-card.pass .value { color: #16a34a; }
        .stat-card.fail .value { color: #dc2626; }
        .stat-card.na .value { color: #64748b; }
        .stat-card.total .value { color: #2563eb; }
        .findings {
          margin-top: 30px;
        }
        .findings h2 {
          font-size: 18px;
          margin-bottom: 20px;
          color: #1e40af;
        }
        .finding-item {
          padding: 15px;
          margin-bottom: 15px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          page-break-inside: avoid;
        }
        .finding-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          gap: 10px;
        }
        .finding-title {
          flex: 1;
          font-weight: 600;
          font-size: 14px;
          color: #1e293b;
        }
        .result-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
        }
        .result-badge.pass {
          background: #dcfce7;
          color: #166534;
        }
        .result-badge.fail {
          background: #fee2e2;
          color: #991b1b;
        }
        .result-badge.na {
          background: #f1f5f9;
          color: #475569;
        }
        .finding-comment {
          color: #64748b;
          font-size: 13px;
          padding-left: 15px;
          border-left: 3px solid #e2e8f0;
          margin-top: 8px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
          text-align: center;
          color: #94a3b8;
          font-size: 12px;
        }
        @media print {
          body { padding: 20px; }
          .info-section { page-break-inside: avoid; }
          .summary { page-break-inside: avoid; }
          .finding-item { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Отчет по аудиту</h1>
        <p>${checklist?.name}</p>
      </div>

      <div class="info-section">
        <div class="info-item">
          <label>Объект проверки</label>
          <value>${organization?.name || '-'}</value>
        </div>
        <div class="info-item">
          <label>Дата проведения</label>
          <value>${new Date(audit.scheduledDate).toLocaleDateString('ru-RU')}</value>
        </div>
        <div class="info-item">
          <label>Дата завершения</label>
          <value>${audit.completedDate ? new Date(audit.completedDate).toLocaleDateString('ru-RU') : '-'}</value>
        </div>
        <div class="info-item">
          <label>Аудитор</label>
          <value>${audit.auditorId}</value>
        </div>
      </div>

      <div class="summary">
        <h2>Общая информация</h2>
        <div class="stats">
          <div class="stat-card total">
            <div class="value">${passRate}%</div>
            <div class="label">Соответствие</div>
          </div>
          <div class="stat-card pass">
            <div class="value">${passCount}</div>
            <div class="label">Соответствует</div>
          </div>
          <div class="stat-card fail">
            <div class="value">${failCount}</div>
            <div class="label">Не соответствует</div>
          </div>
          <div class="stat-card na">
            <div class="value">${naCount}</div>
            <div class="label">Не применимо</div>
          </div>
        </div>
      </div>

      <div class="findings">
        <h2>Результаты проверки</h2>
        ${audit.findings.map(finding => {
          const item = checklist?.items.find(i => i.id === finding.itemId);
          const resultLabel = {
            pass: 'Соответствует',
            fail: 'Не соответствует',
            'n/a': 'Не применимо'
          }[finding.result];
          
          return `
            <div class="finding-item">
              <div class="finding-header">
                <div class="finding-title">${item?.question || '-'}</div>
                <span class="result-badge ${finding.result}">${resultLabel}</span>
              </div>
              ${finding.comment ? `<div class="finding-comment">${finding.comment}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <div class="footer">
        <p>Отчет сформирован автоматически ${new Date().toLocaleDateString('ru-RU')} в ${new Date().toLocaleTimeString('ru-RU')}</p>
      </div>

      <script>
        window.onload = () => {
          setTimeout(() => {
            window.print();
          }, 250);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
