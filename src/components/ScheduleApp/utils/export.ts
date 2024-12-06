import type { Box, Schedule, Restriction } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ScheduleData {
  boxes: Box[];
  schedule: Schedule;
  restrictions: Restriction[];
  exportDate: string;
}

export async function exportToPDF(scheduleRef: HTMLDivElement): Promise<void> {
  try {
    const canvas = await html2canvas(scheduleRef, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('schema.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}

export function exportToJSON(boxes: Box[], schedule: Schedule, restrictions: Restriction[]): void {
  const scheduleData: ScheduleData = {
    boxes: boxes.map(box => ({
      ...box,
      initialQuantity: box.initialQuantity || box.quantity
    })),
    schedule,
    restrictions,
    exportDate: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(scheduleData, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'schema-export.json';
  a.click();
  URL.revokeObjectURL(url);
}

export function validateImportedData(data: any): data is ScheduleData {
  return (
    data &&
    Array.isArray(data.boxes) &&
    typeof data.schedule === 'object' &&
    Array.isArray(data.restrictions)
  );
}