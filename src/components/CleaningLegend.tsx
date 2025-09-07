import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Users } from 'lucide-react';

const cleaningTypes = [
  { type: 'kitchen', label: 'KITCHEN', color: 'bg-cleaning-kitchen' },
  { type: 'bathroom', label: 'BATHROOM', color: 'bg-cleaning-bathroom' },
];

const people = ['Giacomo', 'Marco', 'Franci'];

export function CleaningLegend() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-primary" />
            Tipi di Pulizia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {cleaningTypes.map((item) => (
              <div key={item.type} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${item.color}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Membri della Casa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {people.map((person) => (
              <div key={person} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary" />
                <span className="text-sm font-medium">{person}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}