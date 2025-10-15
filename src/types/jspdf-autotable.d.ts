import 'jspdf';
import { UserOptions } from 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
      finalX: number;
      pageNumber: number;
    };
    autoTable: (options: UserOptions) => jsPDF;
  }
}
