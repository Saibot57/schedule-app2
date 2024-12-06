'use client';

import React, { useState } from 'react';
import { ArrowDownCircle } from 'lucide-react';
import type { Box, Restriction, Schedule } from '../../types';
import { hasRestriction } from '../../utils/schedule';  // Fixed import

interface ScheduleSlotProps {
  day: string;
  time: string;
  slotIndex: number;
  box: Box | undefined;
  boxes: Box[];
  schedule: Schedule;
  restrictions: Restriction[];
  isHighlighted: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onSlotClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function ScheduleSlot({
  day,
  time,
  box,
  boxes,
  schedule,
  restrictions,
  isHighlighted,
  onDragOver,
  onDrop,
  onSlotClick,
  onMouseEnter,
  onMouseLeave
}: ScheduleSlotProps) {
  const [isRestricted, setIsRestricted] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log('Drop event triggered');
    
    const droppedBoxId = Number(e.dataTransfer.getData('boxId'));
    console.log('Dropped box ID:', droppedBoxId);
    
    const droppedBox = boxes.find(b => b.id === droppedBoxId);
    console.log('Found box:', droppedBox);

    if (!droppedBox) {
      console.log('No box found with ID');
      return;
    }

    const timeSlotKey = `${day}-${time}`;
    const conflictingBoxes = Object.entries(schedule)
      .filter(([key, _]) => key.startsWith(timeSlotKey))
      .map(([_, boxId]) => boxes.find(b => b.id === boxId))
      .filter((b): b is Box => b !== undefined);

    console.log('Boxes in same time slot:', conflictingBoxes);

    const hasConflictResult = conflictingBoxes.some(existingBox => 
      hasRestriction(droppedBox.className, existingBox.className, restrictions)
    );

    console.log('Has conflict:', hasConflictResult);

    if (hasConflictResult) {
      e.stopPropagation();
      setIsRestricted(true);
      setTimeout(() => setIsRestricted(false), 2000);
      
      const restrictionErrorDiv = document.createElement('div');
      restrictionErrorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50';
      restrictionErrorDiv.textContent = 'Denna placering bryter mot en restriktion';
      document.body.appendChild(restrictionErrorDiv);
      
      setTimeout(() => {
        restrictionErrorDiv.remove();
      }, 3000);
      
      return;
    }

    onDrop(e);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDragOver(e);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSlotClick();
  };

  return (
    <div
      className={`
        border rounded p-1 cursor-pointer relative 
        min-h-[4.5rem] flex flex-col justify-between
        hover:z-10 hover:scale-105 transition-all
        ${!box ? 'border-dashed border-gray-300' : ''}
        ${isHighlighted ? 'ring-2 ring-offset-2 ring-yellow-500' : ''}
        ${isRestricted ? 'ring-2 ring-offset-2 ring-red-500 shake' : ''}
      `}
      style={{
        ...box ? { backgroundColor: box.color } : {},
        animation: isRestricted ? 'shake 0.5s ease-in-out' : 'none'
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
      {box && (
        <>
          <div className="text-[0.65rem] leading-tight">
            <div className="font-medium mb-0.5 break-words">{box.className}</div>
            <div className="text-gray-600 break-words">{box.teacher}</div>
          </div>
          <div className="flex justify-center mt-1 pdf-hide">
            <ArrowDownCircle size={14} className="text-gray-600" />
          </div>
        </>
      )}
    </div>
  );
}