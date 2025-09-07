import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Users } from 'lucide-react';

const cleaningTypes = [
  { type: 'kitchen', label: 'Cucina', color: 'bg-cleaning-kitchen' },
  { type: 'bathroom', label: 'Bagno', color: 'bg-cleaning-bathroom' },
  { type: 'bedroom', label: 'Camere', color: 'bg-cleaning-bedroom' },
  { type: 'livingroom', label: 'Salotto', color: 'bg-cleaning-livingroom' },
  { type: 'general', label: 'Pulizia Generale', color: 'bg-cleaning-general' },
  { type: 'windows', label: 'Finestre', color: 'bg-cleaning-windows' },
];

const people = ['Marco', 'Laura', 'Andrea', 'Sofia'];

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