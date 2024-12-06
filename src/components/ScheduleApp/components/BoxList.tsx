'use client';

import React, { useState } from 'react';
import { X, Plus, Minus, Edit2, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Button } from '@/components/ui/button/button';
import { Input } from '@/components/ui/input/input';
import type { Box, Schedule } from '../types';
import { getBoxPlacements } from '../utils/schedule';

interface BoxListProps {
  boxes: Box[];
  schedule: Schedule;
  setBoxes: React.Dispatch<React.SetStateAction<Box[]>>;
  onDragStart: (e: React.DragEvent, box: Box) => void;
}

export function BoxList({ boxes, schedule, setBoxes, onDragStart }: BoxListProps) {
  const [editingTeacher, setEditingTeacher] = useState<number | null>(null);
  const [newTeacher, setNewTeacher] = useState('');

  const handleDeleteBox = (id: number) => {
    if (window.confirm('Är du säker på att du vill ta bort denna låda?')) {
      setBoxes((prev) => prev.filter((box) => box.id !== id));
    }
  };

  const handleQuantityChange = (boxId: number, change: number) => {
    setBoxes((prev) =>
      prev.map((box) => {
        if (box.id === boxId) {
          return {
            ...box,
            quantity: Math.max(0, box.quantity + change)
          };
        }
        return box;
      })
    );
  };

  const handleTeacherEdit = (boxId: number) => {
    setBoxes((prev) =>
      prev.map((box) => {
        if (box.id === boxId) {
          return {
            ...box,
            teacher: newTeacher
          };
        }
        return box;
      })
    );
    setEditingTeacher(null);
    setNewTeacher('');
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Tillgängliga lådor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2"> {/* Increased from grid-cols-2 to grid-cols-4 */}
          {boxes
            .filter((box) => box.quantity > 0)
            .map((box) => (
              <div
                key={box.id}
                className="relative p-2 rounded cursor-move flex flex-col min-h-[100px]"
                style={{ backgroundColor: box.color }}
                draggable={box.quantity > 0}
                onDragStart={(e) => onDragStart(e, box)}
                title={getBoxPlacements(box.id, schedule)}
              >
                <button
                  onClick={() => handleDeleteBox(box.id)}
                  className="absolute top-1 left-1 text-gray-500 hover:text-gray-700"
                >
                  <X size={16} />
                </button>

                <div className="font-medium mb-1 mt-4 text-center break-words">
                  {box.className}
                </div>

                <div className="flex items-center justify-center gap-2 my-2">
                  <button
                    onClick={() => handleQuantityChange(box.id, -1)}
                    className="text-gray-500 hover:text-gray-700 p-1 hover:bg-black/5 rounded"
                    disabled={box.quantity <= 0}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm bg-gray-200 px-3 py-1 rounded min-w-[32px] text-center">
                    {box.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(box.id, 1)}
                    className="text-gray-500 hover:text-gray-700 p-1 hover:bg-black/5 rounded"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {editingTeacher === box.id ? (
                  <div className="flex items-center gap-1 mt-1">
                    <Input
                      value={newTeacher}
                      onChange={(e) => setNewTeacher(e.target.value)}
                      className="h-6 text-sm"
                      placeholder="Lärarens namn"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleTeacherEdit(box.id)}
                    >
                      <Check size={14} />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1 break-words"
                    onClick={() => {
                      setEditingTeacher(box.id);
                      setNewTeacher(box.teacher);
                    }}
                  >
                    {box.teacher}
                    <Edit2 size={14} className="cursor-pointer text-gray-400 hover:text-gray-600" />
                  </div>
                )}
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}