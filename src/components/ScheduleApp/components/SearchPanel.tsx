// components/ScheduleApp/components/SearchPanel.tsx
'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/card';
import { Input } from '@/components/ui/input/input';

interface SearchCriterion {
  type: 'single' | 'combination';
  terms: string[];
}

interface SearchPanelProps {
  onSearch: (searchCriteria: SearchCriterion[]) => void;
}

export function SearchPanel({ onSearch }: SearchPanelProps) {
  const [searchText, setSearchText] = useState('');

  const parseSearchText = (text: string) => {
    // Split by semicolon for individual search terms
    const terms = text.split(';').map(term => term.trim()).filter(Boolean);
    
    return terms.map(term => {
      // Check if the term contains a combination (marked by +)
      if (term.includes('+')) {
        return {
          type: 'combination' as const,
          terms: term.split('+').map(t => t.trim()).filter(Boolean)
        };
      }
      return {
        type: 'single' as const,
        terms: [term]
      };
    });
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    const searchCriteria = parseSearchText(value);
    onSearch(searchCriteria);
  };

  return (
    <Card className="mt-4 mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Sök i schemat</CardTitle>
        <Search className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Input
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Ex: Tobias; Anna eller Tema A + Tobias"
            className="w-full"
          />
          <p className="text-sm text-gray-500">
            Använd semikolon (;) för separata sökningar och plus (+) för att kombinera termer
          </p>
        </div>
      </CardContent>
    </Card>
  );
}