import React from 'react';
import { ScheduleSlot } from './ScheduleSlot';
import { SlotInfo } from './SlotInfo';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  
  // Track collapsed days
  const [collapsedDays, setCollapsedDays] = React.useState<Set<string>>(new Set());

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
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

  function getVisibleSlots(day: string, time: string): Array<{ slotIndex: number; box: Box | undefined }> {
    const slots: Array<{ slotIndex: number; box: Box | undefined }> = [];
    const MAX_SLOTS = 5;
    let lastUsedIndex = -1;
    
    for (let i = 0; i < MAX_SLOTS; i++) {
      const box = getBoxInSlot(day, time, i, schedule, boxes);
      if (box) {
        slots.push({ slotIndex: i, box });
        lastUsedIndex = i;
      }
    }
    
    if (slots.length > 0 && slots.length < MAX_SLOTS) {
      slots.push({ slotIndex: lastUsedIndex + 1, box: undefined });
    }
    
    if (slots.length === 0) {
      slots.push({ slotIndex: 0, box: undefined });
    }
    
    return slots;
  }

  const toggleDayCollapse = (day: string) => {
    setCollapsedDays(prev => {
      const newCollapsed = new Set(prev);
      if (newCollapsed.has(day)) {
        newCollapsed.delete(day);
      } else {
        newCollapsed.add(day);
      }
      return newCollapsed;
    });
  };

  // Calculate widths based on visible days
  const getColumnWidth = (day: string) => {
    if (collapsedDays.has(day)) {
      return '40px'; // Width of collapsed column
    }
    const visibleDays = DAYS.length - collapsedDays.size;
    const percentage = 100 / visibleDays;
    return `${percentage}%`;
  };

  return (
    <div 
      ref={scheduleRef} 
      className="mb-8 overflow-x-auto"
      data-html2canvas-ignore-absolute="true"
    >
      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr>
            <th className="border p-2 w-24"></th>
            {DAYS.map((day) => (
              <th 
                key={day} 
                className={`border p-2 font-medium text-gray-700 transition-all duration-300`}
                style={{ 
                  width: getColumnWidth(day),
                }}
              >
                <div className="flex items-center justify-between">
                  {!collapsedDays.has(day) ? (
                    <>
                      <span>{day}</span>
                      <button
                        onClick={() => toggleDayCollapse(day)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => toggleDayCollapse(day)}
                      className="w-full text-gray-500 hover:text-gray-700 transition-colors"
                      title={day}
                    >
                      <ChevronRight size={20} />
                    </button>
                  )}
                </div>
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
              {DAYS.map((day) => {
                const slots = getVisibleSlots(day, time);
                const isCollapsed = collapsedDays.has(day);

                return (
                  <td 
                    key={`${day}-${time}`} 
                    className={`border relative p-2 transition-all duration-300`}
                    style={{ 
                      width: getColumnWidth(day),
                    }}
                  >
                    {!isCollapsed && (
                      <div 
                        className="grid gap-2 min-h-[5rem] transition-all duration-200"
                        style={{ gridTemplateColumns: `repeat(${slots.length}, 1fr)` }}
                      >
                        {slots.map(({ slotIndex, box }) => (
                          <React.Fragment key={slotIndex}>
                            <ScheduleSlot
                              day={day}
                              time={time}
                              slotIndex={slotIndex}
                              box={box}
                              boxes={boxes}
                              schedule={schedule}
                              restrictions={restrictions}
                              isHighlighted={false}
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
                        ))}
                      </div>
                    )}
                    {isCollapsed && (
                      <div className="h-full w-full flex items-center justify-center">
                        <div 
                          className="w-2 h-full rounded bg-gray-200"
                          style={{
                            backgroundColor: slots.some(slot => slot.box) ? slots[0].box?.color : '#e5e7eb'
                          }}
                        />
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}