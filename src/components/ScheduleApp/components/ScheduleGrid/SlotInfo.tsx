'use client';

import React from 'react';
import type { Box } from '../../types';

interface SlotInfoProps {
  box: Box;
  conflicts: number[];
  boxes: Box[];
}

export function SlotInfo({ box, conflicts, boxes }: SlotInfoProps) {
  if (!box) return null;

  return (
    <div className="absolute z-10 bg-white shadow-lg p-2 rounded border border-gray-300">
      <div className="font-medium">{box.className}</div>
      <div className="text-sm text-gray-600">{box.teacher}</div>
      {conflicts.length > 0 && (
        <div className="text-red-500 text-sm mt-1">
          Konflikter med:{' '}
          {conflicts
            .map((id) => boxes.find((b) => b.id === id)?.className)
            .filter(Boolean)
            .join(', ')}
        </div>
      )}
    </div>
  );
}