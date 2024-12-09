'use client';

import React from 'react';
import {
  Download,
  Upload,
  Trash2,
  Printer,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button/button';
import { Tooltip } from '@/components/ui/tooltip/tooltip';

interface HeaderActionsProps {
  onClearSchedule: () => void;
  onExportSchedule: () => void;
  onImportSchedule: () => void;
  onSaveSchedule: () => void;
  isExporting?: boolean;
  isImporting?: boolean;
  isSaving?: boolean;
}

export function HeaderActions({
  onClearSchedule,
  onExportSchedule,
  onImportSchedule,
  onSaveSchedule,
  isExporting = false,
  isImporting = false,
  isSaving = false
}: HeaderActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      <Tooltip content="Exportera JSON" side="bottom">
        <Button
          variant="ghost"
          size="icon"
          onClick={onExportSchedule}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}
        </Button>
      </Tooltip>

      <Tooltip content="Importera JSON" side="bottom">
        <Button
          variant="ghost"
          size="icon"
          onClick={onImportSchedule}
          disabled={isImporting}
        >
          {isImporting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Upload className="h-5 w-5" />
          )}
        </Button>
      </Tooltip>

      <Tooltip content="Spara som PDF" side="bottom">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSaveSchedule}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Printer className="h-5 w-5" />
          )}
        </Button>
      </Tooltip>

      <Tooltip content="Rensa schema" side="bottom">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearSchedule}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </Tooltip>
    </div>
  );
}