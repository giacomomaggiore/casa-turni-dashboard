import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type CleaningType = 'kitchen' | 'bathroom' | 'bedroom' | 'livingroom' | 'general' | 'windows';

interface CleaningAssignment {
  person: string;
  type: CleaningType;
}

interface CleaningDay {
  date: Date;
  assignment?: CleaningAssignment;
}

const cleaningTypeLabels: Record<CleaningType, string> = {
  kitchen: 'Cucina',
  bathroom: 'Bagno',
  bedroom: 'Camere',
  livingroom: 'Salotto',
  general: 'Generale',
  windows: 'Finestre'
};

const cleaningTypeColors: Record<CleaningType, string> = {
  kitchen: 'bg-cleaning-kitchen',
  bathroom: 'bg-cleaning-bathroom',
  bedroom: 'bg-cleaning-bedroom',
  livingroom: 'bg-cleaning-livingroom',
  general: 'bg-cleaning-general',
  windows: 'bg-cleaning-windows'
};

// Dati di esempio per i turni
const sampleAssignments: Record<string, CleaningAssignment> = {
  '2025-01-01': { person: 'Marco', type: 'general' },
  '2025-01-03': { person: 'Laura', type: 'kitchen' },
  '2025-01-05': { person: 'Andrea', type: 'bathroom' },
  '2025-01-07': { person: 'Sofia', type: 'bedroom' },
  '2025-01-10': { person: 'Marco', type: 'livingroom' },
  '2025-01-12': { person: 'Laura', type: 'windows' },
  '2025-01-15': { person: 'Andrea', type: 'kitchen' },
  '2025-01-17': { person: 'Sofia', type: 'bathroom' },
  '2025-01-20': { person: 'Marco', type: 'bedroom' },
  '2025-01-22': { person: 'Laura', type: 'general' },
  '2025-01-25': { person: 'Andrea', type: 'livingroom' },
  '2025-01-27': { person: 'Sofia', type: 'windows' },
  '2025-01-30': { person: 'Marco', type: 'kitchen' },
};

const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export function CleaningCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Aggiungi giorni vuoti all'inizio per allineare con lunedì
  const startDay = getDay(monthStart);
  const emptyDays = startDay === 0 ? 6 : startDay - 1;

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getDayAssignment = (date: Date): CleaningAssignment | undefined => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return sampleAssignments[dateKey];
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-0 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold">
              {format(currentDate, 'MMMM yyyy', { locale: it })}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekDays.map((day) => (
            <div
              key={day}
              className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: emptyDays }).map((_, index) => (
            <div key={`empty-${index}`} className="h-20" />
          ))}
          {calendarDays.map((date) => {
            const assignment = getDayAssignment(date);
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isTodayDate = isToday(date);

            return (
              <div
                key={format(date, 'yyyy-MM-dd')}
                className={`
                  h-20 border rounded-lg p-1 transition-all duration-200 hover:shadow-md
                  ${isCurrentMonth ? 'bg-card' : 'bg-muted/20'}
                  ${isTodayDate ? 'ring-2 ring-primary ring-offset-2' : ''}
                  ${assignment ? cleaningTypeColors[assignment.type] + '/10 border-' + assignment.type.replace('cleaning-', '') : ''}
                `}
              >
                <div className="flex flex-col h-full">
                  <div className={`text-sm font-medium ${isTodayDate ? 'text-primary' : 'text-foreground'}`}>
                    {format(date, 'd')}
                  </div>
                  {assignment && (
                    <div className="flex-1 flex flex-col justify-center items-center text-center">
                      <div className={`
                        w-full px-1 py-0.5 rounded text-xs font-medium text-white
                        ${cleaningTypeColors[assignment.type]}
                      `}>
                        {assignment.person}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {cleaningTypeLabels[assignment.type]}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}