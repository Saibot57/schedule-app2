import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import type { Box, FormData } from '../types';
import { generateBoxColor } from '../../../colorManagement';

interface BoxCreationFormProps {
  boxes: Box[];
  setBoxes: React.Dispatch<React.SetStateAction<Box[]>>;
}

export function BoxCreationForm({ boxes, setBoxes }: BoxCreationFormProps) {
  const [formData, setFormData] = React.useState<FormData>({
    className: '',
    teacher: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if the class already exists
    const existingClassIndex = boxes.findIndex(
      (box) => box.className === formData.className && box.teacher === formData.teacher
    );

    const quantity = parseInt(prompt('Hur många enheter vill du skapa?', '1') || '0', 10);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Ogiltigt antal enheter. Ange ett positivt heltal.');
      return;
    }

    if (existingClassIndex > -1) {
      // If the class exists, increment its quantity
      setBoxes((prev) =>
        prev.map((box, index) =>
          index === existingClassIndex
            ? { ...box, quantity: (box.quantity || 0) + quantity }
            : box
        )
      );
    } else {
      // If the class does not exist, create a new one with a generated color
      const newBox: Box = {
        id: Date.now(),
        className: formData.className,
        teacher: formData.teacher,
        color: generateBoxColor(formData.className),
        quantity: quantity,
        usageCount: 0
      };
      setBoxes((prev) => [...prev, newBox]);
    }

    setFormData({ className: '', teacher: '' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skapa ny låda</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Klassnamn
            </label>
            <input
              type="text"
              value={formData.className}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, className: e.target.value }))
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lärare
            </label>
            <input
              type="text"
              value={formData.teacher}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, teacher: e.target.value }))
              }
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Skapa ny låda
          </button>
        </form>
      </CardContent>
    </Card>
  );
}