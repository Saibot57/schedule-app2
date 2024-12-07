'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BoxCreationForm } from './components/BoxCreationForm';
import { BoxList } from './components/BoxList';
import { FilterPanel } from './components/FilterPanel';
import { ScheduleGrid } from './components/ScheduleGrid';
import { RestrictionsPanel } from './components/RestrictionsPanel';
import { Statistics } from './components/Statistics';
import type { Box, Schedule, Filter, Restriction } from './types';

export default function ScheduleApp() {
  // State management
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [schedule, setSchedule] = useState<Schedule>({});
  const [draggedBox, setDraggedBox] = useState<Box | null>(null);
  const [restrictions, setRestrictions] = useState<Restriction[]>([]);
  const [showRestrictions, setShowRestrictions] = useState(false);
  const [filter, setFilter] = useState<Filter>({
    label1: '',
    label2: '',
    condition: 'both'
  });

  const scheduleRef = useRef<HTMLDivElement>(null);

  // Load saved state on initial render
  useEffect(() => {
    const savedState = localStorage.getItem('scheduleState');
    if (savedState) {
      try {
        const { boxes, schedule, restrictions } = JSON.parse(savedState);
        setBoxes(
          boxes.map((box: Box) => ({
            ...box,
            initialQuantity: box.initialQuantity || box.quantity
          }))
        );
        setSchedule(schedule);
        setRestrictions(restrictions);
      } catch (error) {
        console.error('Failed to load state from local storage:', error);
      }
    }
  }, []);

  // Save state on updates
  useEffect(() => {
    try {
      localStorage.setItem(
        'scheduleState',
        JSON.stringify({
          boxes: boxes.map(box => ({
            ...box,
            initialQuantity: box.initialQuantity || box.quantity
          })),
          schedule,
          restrictions
        })
      );
    } catch (error) {
      console.error('Failed to save state to local storage:', error);
    }
  }, [boxes, schedule, restrictions]);

  const handleDragStart = (e: React.DragEvent, box: Box) => {
    setDraggedBox(box);
    e.dataTransfer.setData('boxId', box.id.toString());
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (day: string, time: string, slotIndex: number) => {
    if (!draggedBox) return;
    
    const slotKey = `${day}-${time}-${slotIndex}`;
    setSchedule(prev => ({ ...prev, [slotKey]: draggedBox.id }));
    
    // Update box quantity
    setBoxes(prev =>
      prev.map(box =>
        box.id === draggedBox.id
          ? { ...box, quantity: box.quantity - 1 }
          : box
      )
    );
  };

  const handleSlotClick = (day: string, time: string, slotIndex: number) => {
    const slotKey = `${day}-${time}-${slotIndex}`;
    if (schedule[slotKey]) {
      const boxId = schedule[slotKey];
      setBoxes(prev =>
        prev.map(box =>
          box.id === boxId
            ? { ...box, quantity: box.quantity + 1 }
            : box
        )
      );
      setSchedule(prev => {
        const newSchedule = { ...prev };
        delete newSchedule[slotKey];
        return newSchedule;
      });
    }
  };

  return (
    <div className="w-full mx-auto px-2 bg-white">
      <FilterPanel filter={filter} setFilter={setFilter} />
      
      <ScheduleGrid
        boxes={boxes}
        schedule={schedule}
        restrictions={restrictions}
        filter={filter}
        draggedBox={draggedBox}
        scheduleRef={scheduleRef}
        onDrop={handleDrop}
        onSlotClick={handleSlotClick}
        onSlotHover={(day, time) => {
          // Handle hover state directly in the callback
        }}
      />
      
      <div className="flex gap-4">
        {/* Left side - Available Boxes */}
        <div className="w-3/4">
          <BoxList
            boxes={boxes}
            schedule={schedule}
            setBoxes={setBoxes}
            onDragStart={handleDragStart}
          />
        </div>
        
        {/* Right side - Form and Statistics */}
        <div className="w-1/4 space-y-4">
          <BoxCreationForm
            boxes={boxes}
            setBoxes={setBoxes}
          />
          
          <Statistics
            boxes={boxes}
            schedule={schedule}
            scheduleRef={scheduleRef}
            setBoxes={setBoxes}
            setSchedule={setSchedule}
            setRestrictions={setRestrictions}
          />
        </div>
      </div>
      
      <RestrictionsPanel
        restrictions={restrictions}
        showRestrictions={showRestrictions}
        setRestrictions={setRestrictions}
        setShowRestrictions={setShowRestrictions}
      />
    </div>
  );
}