import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export interface PDFExportOptions {
  title: string;
  subtitle?: string;
  stats: Array<{ label: string; value: string | number }>;
  tables?: Array<{
    title: string;
    headers: string[];
    data: string[][];
  }>;
  footer?: string;
}

export async function exportToPDF(options: PDFExportOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 15;

  const addFont = () => {
    const fontUrl = 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2';
    try {
    } catch (error) {
      console.warn('Failed to load custom font, using default');
    }
  };

  addFont();

  const checkPageBreak = (height: number) => {
    if (currentY + height > pageHeight - 20) {
      doc.addPage();
      currentY = 15;
      return true;
    }
    return false;
  };

  doc.setFontSize(18);
  doc.setTextColor(31, 41, 55);
  doc.text(options.title, pageWidth / 2, currentY, { align: 'center' });
  currentY += 10;

  if (options.subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(options.subtitle, pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;
  }

  doc.setFontSize(10);
  doc.setTextColor(156, 163, 175);
  doc.text(`Дата создания: ${new Date().toLocaleDateString('ru-RU', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 12;

  if (options.stats && options.stats.length > 0) {
    checkPageBreak(50);
    
    doc.setFillColor(249, 250, 251);
    doc.rect(15, currentY - 5, pageWidth - 30, 8, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    doc.text('Основные показатели', 17, currentY);
    currentY += 10;

    const statsPerRow = 2;
    const statWidth = (pageWidth - 40) / statsPerRow;
    let statsInRow = 0;
    let statsRowY = currentY;

    options.stats.forEach((stat, index) => {
      if (statsInRow === statsPerRow) {
        statsInRow = 0;
        statsRowY += 20;
        checkPageBreak(20);
      }

      const x = 20 + (statsInRow * statWidth);
      const y = statsRowY;

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(x, y, statWidth - 5, 15, 2, 2, 'FD');

      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(stat.label, x + 3, y + 5);

      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text(String(stat.value), x + 3, y + 11);

      statsInRow++;
    });

    currentY = statsRowY + 20;
  }

  if (options.tables && options.tables.length > 0) {
    options.tables.forEach((table, tableIndex) => {
      checkPageBreak(30);
      
      doc.setFillColor(249, 250, 251);
      doc.rect(15, currentY - 5, pageWidth - 30, 8, 'F');
      
      doc.setFontSize(12);
      doc.setTextColor(31, 41, 55);
      doc.text(table.title, 17, currentY);
      currentY += 8;

      autoTable(doc, {
        head: [table.headers],
        body: table.data,
        startY: currentY,
        margin: { left: 15, right: 15 },
        styles: {
          font: 'helvetica',
          fontSize: 9,
          cellPadding: 3,
          textColor: [31, 41, 55],
        },
        headStyles: {
          fillColor: [249, 250, 251],
          textColor: [31, 41, 55],
          fontStyle: 'bold',
          lineWidth: 0.1,
          lineColor: [229, 231, 235],
        },
        bodyStyles: {
          lineWidth: 0.1,
          lineColor: [229, 231, 235],
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251],
        },
        didDrawPage: (data) => {
          currentY = data.cursor?.y || currentY;
        },
      });

      currentY = doc.lastAutoTable.finalY + 10;
    });
  }

  const footerY = pageHeight - 10;
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  
  if (options.footer) {
    doc.text(options.footer, pageWidth / 2, footerY, { align: 'center' });
  } else {
    doc.text('Сгенерировано автоматически', pageWidth / 2, footerY, { align: 'center' });
  }

  const totalPages = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Страница ${i} из ${totalPages}`,
      pageWidth - 20,
      footerY,
      { align: 'right' }
    );
  }

  const fileName = `${options.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
