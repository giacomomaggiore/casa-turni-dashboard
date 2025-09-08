import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette, Users } from 'lucide-react';
import { cleaningTypeColors, cleaningTypeLabels, people, personColors } from '@/contexts/CleaningContext';


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
            {Object.entries(cleaningTypeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${color}`} />
                <span className="text-sm font-medium">{cleaningTypeLabels[type as keyof typeof cleaningTypeLabels]}</span>
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
                <div className={`w-4 h-4 rounded-full ${personColors[person]}`} />
                <span className="text-sm font-medium text-black">{person}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}