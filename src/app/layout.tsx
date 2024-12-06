"use client";
import { Inter } from 'next/font/google';
import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './globals.css';
import { HeaderActions } from '@/components/ScheduleApp/components/HeaderActions';
import { initializeColorSystem, importColors } from '../colorManagement';

const inter = Inter({ subsets: ['latin'] });

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize color system on mount
  useEffect(() => {
    const boxes = localStorage.getItem('boxes');
    if (boxes) {
      const parsedBoxes = JSON.parse(boxes);
      const existingColors = parsedBoxes.map((box: any) => box.color);
      importColors(existingColors);
    } else {
      initializeColorSystem();
    }
  }, []);

  const handleClearSchedule = () => {
    if (window.confirm('Är du säker på att du vill rensa schemat?')) {
      // Clear all schedule-related items
      localStorage.removeItem('scheduleState');  // This contains boxes, schedule, and restrictions
      localStorage.removeItem('schedule');
      localStorage.removeItem('boxes');
      
      // Reset color system
      initializeColorSystem();
      
      // Force a complete reset of the application state
      window.location.reload();
    }
  };

  const handleExportSchedule = async () => {
    try {
      setIsExporting(true);
      
      // Get the complete schedule state
      const savedState = localStorage.getItem('scheduleState');
      if (!savedState) {
        throw new Error('No schedule state found');
      }

      const scheduleState = JSON.parse(savedState);
      
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
            const data = JSON.parse(content);
  
            // Validate the imported data structure
            if (!data.boxes || !Array.isArray(data.boxes)) {
              throw new Error('Invalid boxes data');
            }
            if (!data.schedule || typeof data.schedule !== 'object') {
              throw new Error('Invalid schedule data');
            }
            if (!Array.isArray(data.restrictions)) {
              throw new Error('Invalid restrictions data');
            }
  
            // Ensure boxes have the required properties
            data.boxes = data.boxes.map((box: any) => ({
              id: box.id,
              className: box.className,
              teacher: box.teacher,
              color: box.color,
              quantity: box.quantity,
              usageCount: box.usageCount || 0,
              initialQuantity: box.initialQuantity || box.quantity
            }));
  
            // Import colors if they exist
            if (data.boxes && Array.isArray(data.boxes)) {
              const boxData = data.boxes.map((box: any) => ({
                className: box.className,
                color: box.color
              }));
              importColors(boxData);
            }
            
            // Save the complete state
            const stateToSave = {
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
      
      // Use the scheduleRef to get the correct element
      const scheduleElement = document.querySelector('[ref="scheduleRef"]') || 
                            document.querySelector('.mb-8.overflow-x-auto');
                            
      if (!scheduleElement) {
        throw new Error('Schedule element not found');
      }
  
      // Add temporary styles for better PDF output
      const originalStyle = scheduleElement.getAttribute('style') || '';
      scheduleElement.setAttribute('style', `${originalStyle}; background-color: white; padding: 20px;`);
      
      // Add temporary style to hide PDF-excluded elements
      const style = document.createElement('style');
      style.id = 'pdf-temp-style'; // Add an ID for easier cleanup
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
  
      // Cleanup: Remove the temporary style and restore original styles
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
  
      // Calculate dimensions while maintaining aspect ratio
      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Center the content if it's smaller than the page
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