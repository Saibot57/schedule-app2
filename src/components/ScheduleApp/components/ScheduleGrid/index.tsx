import React from 'react';
import { ScheduleSlot } from './ScheduleSlot';
import { SlotInfo } from './SlotInfo';
import type { Box, Schedule, Filter, Restriction, HoverInfo } from '../../types';
import { DAYS, TIME_PERIODS } from '../../types';
import { getBoxInSlot, getConflicts, checkRestrictions } from '../../utils/schedule';

interface ScheduleGridProps {
  boxes: Box[];
  schedule: Schedule;
  restrictions: Restriction[];
  filter: Filter;
  draggedBox: Box | null;
  scheduleRef: React.RefObject<HTMLDivElement>;
  onDrop: (day: string, time: string, slotIndex: number) => void;
  onSlotClick: (day: string, time: string, slotIndex: number) => void;
  onSlotHover: (day: string | null, time: string | null) => void;
}

export function ScheduleGrid({
  boxes,
  schedule,
  restrictions,
  filter,
  draggedBox,
  scheduleRef,
  onDrop,
  onSlotClick,
  onSlotHover
}: ScheduleGridProps) {
  const [hoverInfo, setHoverInfo] = React.useState<HoverInfo>({
    day: null,
    time: null,
    slotIndex: null,
    show: false
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const shouldHighlightSlot = (day: string, time: string, slotIndex: number): boolean => {
    const box = getBoxInSlot(day, time, slotIndex, schedule, boxes);
    if (!box || !filter) return false;
    if (!filter.label1 && !filter.label2) return false;

    const label1 = filter.label1 || null;
    const label2 = filter.label2 || null;

    const hasLabel1 = label1 && (box.className.includes(label1) || box.teacher.includes(label1));
    const hasLabel2 = label2 && (box.className.includes(label2) || box.teacher.includes(label2));

    switch (filter.condition) {
      case 'both':
        return Boolean(hasLabel1 && hasLabel2);
      case 'neither':
        return Boolean(!hasLabel1 && !hasLabel2);
      case 'x-not-y':
        return Boolean(hasLabel1 && !hasLabel2);
      default:
        return false;
    }
  };

  const handleDrop = (e: React.DragEvent, day: string, time: string, slotIndex: number) => {
    e.preventDefault();
    if (!draggedBox) return;

    if (checkRestrictions(draggedBox.id, day, time, schedule, boxes, restrictions)) {
      const proceed = window.confirm(
        'Denna placering bryter mot en restriktion. Vill du överskrida den tillfälligt?'
      );
      if (!proceed) return;
    }

    onDrop(day, time, slotIndex);
  };

  return (
    <div 
      ref={scheduleRef} 
      className="mb-8 overflow-x-auto"
      data-html2canvas-ignore-absolute="true"
    >
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2 w-24"></th>
            {DAYS.map((day) => (
              <th key={day} className="border p-2 font-medium text-gray-700">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_PERIODS.map((time) => (
            <tr key={time}>
              <td className="border font-medium text-gray-700 text-center px-2 py-2 w-28">
                {time}
              </td>
              {DAYS.map((day) => (
                <td key={`${day}-${time}`} className="border relative p-2">
                  <div className="grid grid-cols-5 gap-2 min-h-[5rem]">
                    {[...Array(5)].map((_, slotIndex) => {
                      const box = getBoxInSlot(day, time, slotIndex, schedule, boxes);
                      const isHighlighted = shouldHighlightSlot(day, time, slotIndex);

                      return (
                        <React.Fragment key={slotIndex}>
                          <ScheduleSlot
                            day={day}
                            time={time}
                            slotIndex={slotIndex}
                            box={box}
                            boxes={boxes}
                            schedule={schedule}
                            restrictions={restrictions}
                            isHighlighted={isHighlighted}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, day, time, slotIndex)}
                            onSlotClick={() => onSlotClick(day, time, slotIndex)}
                            onMouseEnter={() => {
                              onSlotHover(day, time);
                              setHoverInfo({ day, time, slotIndex, show: true });
                            }}
                            onMouseLeave={() => {
                              onSlotHover(null, null);
                              setHoverInfo({ day: null, time: null, slotIndex: null, show: false });
                            }}
                          />
                          {hoverInfo.show &&
                            hoverInfo.day === day &&
                            hoverInfo.time === time &&
                            hoverInfo.slotIndex === slotIndex &&
                            box && (
                              <SlotInfo
                                box={box}
                                conflicts={getConflicts(box.id, day, time, schedule, boxes, restrictions)}
                                boxes={boxes}
                              />
                            )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}