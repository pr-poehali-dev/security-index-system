import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AttestationOrder, OrderEmployee } from '@/stores/attestationOrdersStore';

interface ExportOptions {
  includeAppendix: boolean;
  includeSignatures: boolean;
}

export async function exportOrderToDocx(
  order: AttestationOrder,
  employees: OrderEmployee[],
  options: ExportOptions
): Promise<void> {
  const attestationTypeLabel = order.attestationType === 'rostechnadzor' 
    ? 'Ростехнадзор' 
    : 'Комиссия предприятия';

  const sections: any[] = [
    new Paragraph({
      text: 'ПРИКАЗ',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 }
    }),
    new Paragraph({
      text: `№ ${order.number}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 }
    }),
    new Paragraph({
      text: `от ${new Date(order.date).toLocaleDateString('ru-RU')}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    }),
    new Paragraph({
      text: 'О направлении на аттестацию',
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Тип аттестации: ',
          bold: true
        }),
        new TextRun(attestationTypeLabel)
      ],
      spacing: { after: 200 }
    })
  ];

  if (order.notes) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Примечания: ',
            bold: true
          }),
          new TextRun(order.notes)
        ],
        spacing: { after: 200 }
      })
    );
  }

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'ПРИКАЗЫВАЮ:',
          bold: true
        })
      ],
      spacing: { before: 200, after: 200 }
    }),
    new Paragraph({
      text: `1. Направить на аттестацию ${employees.length} сотрудников согласно приложению к настоящему приказу.`,
      spacing: { after: 200 }
    }),
    new Paragraph({
      text: '2. Контроль за исполнением настоящего приказа оставляю за собой.',
      spacing: { after: 400 }
    })
  );

  if (options.includeAppendix && employees.length > 0) {
    sections.push(
      new Paragraph({
        text: '',
        pageBreakBefore: true
      }),
      new Paragraph({
        text: 'ПРИЛОЖЕНИЕ',
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: `к приказу № ${order.number} от ${new Date(order.date).toLocaleDateString('ru-RU')}`,
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 }
      }),
      new Paragraph({
        text: 'Список сотрудников, направляемых на аттестацию',
        heading: HeadingLevel.HEADING_3,
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 }
      })
    );

    const tableRows = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: '№', bold: true, alignment: AlignmentType.CENTER })],
            width: { size: 5, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ text: 'ФИО', bold: true, alignment: AlignmentType.CENTER })],
            width: { size: 20, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Организация', bold: true, alignment: AlignmentType.CENTER })],
            width: { size: 15, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Должность', bold: true, alignment: AlignmentType.CENTER })],
            width: { size: 15, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Область аттестации', bold: true, alignment: AlignmentType.CENTER })],
            width: { size: 25, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ text: '№ ДПО', bold: true, alignment: AlignmentType.CENTER })],
            width: { size: 12, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ text: 'Дата ДПО', bold: true, alignment: AlignmentType.CENTER })],
            width: { size: 8, type: WidthType.PERCENTAGE }
          })
        ]
      })
    ];

    employees.forEach((emp, index) => {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: String(index + 1), alignment: AlignmentType.CENTER })]
            }),
            new TableCell({
              children: [new Paragraph(emp.fullName)]
            }),
            new TableCell({
              children: [new Paragraph(emp.organizationName)]
            }),
            new TableCell({
              children: [new Paragraph(emp.position)]
            }),
            new TableCell({
              children: [new Paragraph(emp.attestationArea)]
            }),
            new TableCell({
              children: [new Paragraph(emp.certificateNumber)]
            }),
            new TableCell({
              children: [new Paragraph(new Date(emp.certificateDate).toLocaleDateString('ru-RU'))]
            })
          ]
        })
      );
    });

    sections.push(
      new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
      })
    );
  }

  if (options.includeSignatures) {
    sections.push(
      new Paragraph({
        text: '',
        spacing: { before: 600 }
      }),
      new Paragraph({
        children: [
          new TextRun('Руководитель организации'),
          new TextRun('\t\t\t'),
          new TextRun('_________________')
        ],
        spacing: { after: 200 }
      }),
      new Paragraph({
        text: 'М.П.',
        spacing: { before: 200 }
      })
    );
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: sections
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Приказ_${order.number.replace(/[/\\]/g, '_')}.docx`);
}

export async function exportOrderToPdf(
  order: AttestationOrder,
  employees: OrderEmployee[],
  options: ExportOptions
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const attestationTypeLabel = order.attestationType === 'rostechnadzor' 
    ? 'Ростехнадзор' 
    : 'Комиссия предприятия';

  let yPos = 20;

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('ПРИКАЗ', 105, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(14);
  doc.text(`№ ${order.number}`, 105, yPos, { align: 'center' });
  
  yPos += 8;
  doc.setFontSize(12);
  doc.text(`от ${new Date(order.date).toLocaleDateString('ru-RU')}`, 105, yPos, { align: 'center' });
  
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('О направлении на аттестацию', 105, yPos, { align: 'center' });
  
  yPos += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Тип аттестации: ${attestationTypeLabel}`, 20, yPos);

  if (order.notes) {
    yPos += 8;
    doc.text(`Примечания: ${order.notes}`, 20, yPos, { maxWidth: 170 });
    yPos += 8;
  }

  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('ПРИКАЗЫВАЮ:', 20, yPos);
  
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.text(`1. Направить на аттестацию ${employees.length} сотрудников согласно приложению.`, 20, yPos, { maxWidth: 170 });
  
  yPos += 10;
  doc.text('2. Контроль за исполнением настоящего приказа оставляю за собой.', 20, yPos, { maxWidth: 170 });

  if (options.includeAppendix && employees.length > 0) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ПРИЛОЖЕНИЕ', 105, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setFontSize(11);
    doc.text(`к приказу № ${order.number} от ${new Date(order.date).toLocaleDateString('ru-RU')}`, 105, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(12);
    doc.text('Список сотрудников, направляемых на аттестацию', 105, yPos, { align: 'center' });

    const tableData = employees.map((emp, index) => [
      String(index + 1),
      emp.fullName,
      emp.organizationName,
      emp.position,
      emp.attestationArea,
      emp.certificateNumber,
      new Date(emp.certificateDate).toLocaleDateString('ru-RU')
    ]);

    autoTable(doc, {
      startY: yPos + 8,
      head: [['№', 'ФИО', 'Организация', 'Должность', 'Область', '№ ДПО', 'Дата ДПО']],
      body: tableData,
      styles: { 
        fontSize: 9,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 45 },
        5: { cellWidth: 25 },
        6: { cellWidth: 20 }
      },
      margin: { left: 5, right: 5 }
    });
  }

  if (options.includeSignatures) {
    const finalY = (doc as any).lastAutoTable?.finalY || yPos + 20;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Руководитель организации', 20, finalY + 20);
    doc.text('_________________', 110, finalY + 20);
    doc.text('М.П.', 20, finalY + 30);
  }

  doc.save(`Приказ_${order.number.replace(/[/\\]/g, '_')}.pdf`);
}
