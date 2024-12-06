'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Input } from '@/components/ui/input/input';
import { Select } from '@/components/ui/select/select';
import type { Filter } from '../types';

interface FilterPanelProps {
  filter: Filter;
  setFilter: (filter: Filter) => void;
}

export function FilterPanel({ filter, setFilter }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const conditions: Array<{ value: Filter['condition']; label: string }> = [
    { value: 'both', label: 'Båda' },
    { value: 'neither', label: 'Ingen' },
    { value: 'x-not-y', label: 'X men inte Y' }
  ];

  return (
    <Card className="mt-4">
      <CardHeader
        className="cursor-pointer flex flex-row items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="text-lg">Filtrera</CardTitle>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">X (Lärare)</label>
            <Input
              value={filter.label1 || ''}
              onChange={(e) => setFilter({ ...filter, label1: e.target.value })}
              placeholder="Ange lärare..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Y (Lärare)</label>
            <Input
              value={filter.label2 || ''}
              onChange={(e) => setFilter({ ...filter, label2: e.target.value })}
              placeholder="Ange lärare..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Villkor</label>
            <Select
              value={filter.condition}
              onChange={(e) => setFilter({ ...filter, condition: e.target.value as Filter['condition'] })}
              options={conditions}
              placeholder="Välj villkor"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}