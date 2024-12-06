'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Input } from '@/components/ui/input/input';
import type { Restriction } from '../types';

interface RestrictionsPanelProps {
  restrictions: Restriction[];
  showRestrictions: boolean;
  setRestrictions: React.Dispatch<React.SetStateAction<Restriction[]>>;
  setShowRestrictions: React.Dispatch<React.SetStateAction<boolean>>;
}

export function RestrictionsPanel({
  restrictions,
  showRestrictions,
  setRestrictions,
  setShowRestrictions
}: RestrictionsPanelProps) {
  const [restrictionForm, setRestrictionForm] = React.useState({
    pattern1: '',
    pattern2: ''
  });

  const handleAddRestriction = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!restrictionForm.pattern1 || !restrictionForm.pattern2) {
      alert('Båda fälten måste fyllas i');
      return;
    }

    if (restrictionForm.pattern1 === restrictionForm.pattern2) {
      alert('Mönstren kan inte vara identiska');
      return;
    }

    const exists = restrictions.some(
      (r) =>
        (r.pattern1 === restrictionForm.pattern1 && r.pattern2 === restrictionForm.pattern2) ||
        (r.pattern1 === restrictionForm.pattern2 && r.pattern2 === restrictionForm.pattern1)
    );

    if (exists) {
      alert('Denna restriktion finns redan');
      return;
    }

    const newRestriction: Restriction = {
      id: Date.now(),
      pattern1: restrictionForm.pattern1,
      pattern2: restrictionForm.pattern2
    };

    setRestrictions((prev) => [...prev, newRestriction]);
    setRestrictionForm({ pattern1: '', pattern2: '' });
  };

  const handleDeleteRestriction = (restrictionId: number) => {
    setRestrictions((prev) => prev.filter((r) => r.id !== restrictionId));
  };

  return (
    <div className="mt-4">
      <button
        className="w-full bg-gray-100 p-2 text-gray-700 hover:bg-gray-200"
        onClick={() => setShowRestrictions(!showRestrictions)}
      >
        {showRestrictions ? 'Dölj restriktioner' : 'Redigera restriktioner'}
      </button>

      <div className={`mt-4 p-4 border rounded ${showRestrictions ? '' : 'hidden'}`}>
        <Card>
          <CardHeader>
            <CardTitle>Hantera restriktioner</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddRestriction} className="mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mönster 1
                  </label>
                  <Input
                    value={restrictionForm.pattern1}
                    onChange={(e) =>
                      setRestrictionForm((prev) => ({ ...prev, pattern1: e.target.value }))
                    }
                    placeholder="Ex: Tema *"
                    className="w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mönster 2
                  </label>
                  <Input
                    value={restrictionForm.pattern2}
                    onChange={(e) =>
                      setRestrictionForm((prev) => ({ ...prev, pattern2: e.target.value }))
                    }
                    placeholder="Ex: Engelska * *"
                    className="w-full"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Lägg till restriktion
              </button>
            </form>

            <div className="space-y-2">
              {restrictions.map((restriction) => (
                <div
                  key={restriction.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span>
                    {restriction.pattern1} ↔ {restriction.pattern2}
                  </span>
                  <button
                    onClick={() => handleDeleteRestriction(restriction.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}