"use client";

import * as React from 'react';
import { Inter } from 'next/font/google';
import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './globals.css';
import { HeaderActions } from '@/components/ScheduleApp/components/HeaderActions';
import { initializeColorSystem, importColors } from '../colorManagement';
import { Box, ScheduleState } from '../types';

const inter = Inter({ subsets: ['latin'] });

interface RootLayoutProps {
  children: React.ReactNode;
}

function RootLayout({ children }: RootLayoutProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const boxes = localStorage.getItem('boxes');
    if (boxes) {
      const parsedBoxes: Box[] = JSON.parse(boxes);
      const boxData: Array<{ className: string; color: string }> = parsedBoxes.map((box: Box) => ({
        className: box.className,
        color: box.color
      }));
      importColors(boxData);
    } else {
      initializeColorSystem();
    }
  }, []);

  const handleClearSchedule = () => {
    if (window.confirm('Är du säker på att du vill rensa schemat?')) {
      localStorage.removeItem('scheduleState');
      localStorage.removeItem('schedule');
      localStorage.removeItem('boxes');
      initializeColorSystem();
      window.location.reload();
    }
  };

  const handleExportSchedule = async () => {
    try {
      setIsExporting(true);
      const savedState = localStorage.getItem('scheduleState');
      if (!savedState) {
        throw new Error('No schedule state found');
      }

      const scheduleState: ScheduleState = JSON.parse(savedState);
      const blob = new Blob([JSON.stringify(scheduleState, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `schedule-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export misslyckades. Försök igen.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportSchedule = async () => {
    try {
      setIsImporting(true);
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onerror = (error) => {
          console.error('FileReader error:', error);
          alert('Läsning av filen misslyckades.');
        };

        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            const data: ScheduleState = JSON.parse(content);

            if (!data.boxes || !Array.isArray(data.boxes)) {
              throw new Error('Invalid boxes data');
            }
            if (!data.schedule || typeof data.schedule !== 'object') {
              throw new Error('Invalid schedule data');
            }
            if (!Array.isArray(data.restrictions)) {
              throw new Error('Invalid restrictions data');
            }

            data.boxes = data.boxes.map((box: Box) => ({
              id: box.id,
              className: box.className,
              teacher: box.teacher,
              color: box.color,
              quantity: box.quantity,
              usageCount: box.usageCount || 0,
              initialQuantity: box.initialQuantity || box.quantity
            }));

            const boxData = data.boxes.map((box: Box) => ({
              className: box.className,
              color: box.color
            }));
            importColors(boxData);

            const stateToSave: ScheduleState = {
              boxes: data.boxes,
              schedule: data.schedule,
              restrictions: data.restrictions
            };

            localStorage.setItem('scheduleState', JSON.stringify(stateToSave));
            window.location.reload();
          } catch (error) {
            console.error('Import processing failed:', error);
            alert('Import misslyckades. Kontrollera filformatet: ' + (error as Error).message);
          }
        };

        reader.readAsText(file);
      };

      input.click();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import misslyckades. Försök igen.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSaveSchedule = async () => {
    try {
      setIsSaving(true);
      const scheduleElement =
        document.querySelector('[ref="scheduleRef"]') ||
        document.querySelector('.mb-8.overflow-x-auto');

      if (!scheduleElement) {
        throw new Error('Schedule element not found');
      }

      const originalStyle = scheduleElement.getAttribute('style') || '';
      scheduleElement.setAttribute(
        'style',
        `${originalStyle}; background-color: white; padding: 20px;`
      );

      const style = document.createElement('style');
      style.id = 'pdf-temp-style';
      style.textContent = '.pdf-hide { display: none !important; }';
      document.head.appendChild(style);

      const canvas = await html2canvas(scheduleElement as HTMLElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowWidth: scheduleElement.scrollWidth,
        windowHeight: scheduleElement.scrollHeight
      });

      scheduleElement.setAttribute('style', originalStyle);
      const tempStyle = document.getElementById('pdf-temp-style');
      if (tempStyle) {
        tempStyle.remove();
      }

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const xOffset = Math.max(0, (297 - imgWidth) / 2);
      const yOffset = Math.max(0, (210 - imgHeight) / 2);

      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        xOffset,
        yOffset,
        imgWidth,
        imgHeight
      );

      pdf.save(`schema-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export misslyckades. Försök igen.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <html lang="sv">
      <body className={inter.className}>
        <div className="min-h-screen w-[99.5%] max-w-[1800px] mx-auto py-4">
          <header className="flex justify-between items-center mb-6 bg-white/60 backdrop-blur-sm sticky top-0 z-50 py-4 px-4">
            <h1 className="text-2xl font-bold">Schemaläggning</h1>
            <HeaderActions
              onClearSchedule={handleClearSchedule}
              onExportSchedule={handleExportSchedule}
              onImportSchedule={handleImportSchedule}
              onSaveSchedule={handleSaveSchedule}
              isExporting={isExporting}
              isImporting={isImporting}
              isSaving={isSaving}
            />
          </header>
          <main className="px-4">{children}</main>
        </div>
      </body>
    </html>
  );
}

export default RootLayout;