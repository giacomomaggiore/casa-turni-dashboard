import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

type CleaningType = 'kitchen' | 'bathroom';

interface CleaningAssignment {
  person: string;
  type: CleaningType;
}

interface CleaningDay {
  date: Date;
  assignment?: CleaningAssignment;
}

const cleaningTypeLabels: Record<CleaningType, string> = {
  kitchen: 'KITCHEN',
  bathroom: 'BATHROOM'
};

const cleaningTypeColors: Record<CleaningType, string> = {
  kitchen: 'bg-cleaning-kitchen',
  bathroom: 'bg-cleaning-bathroom'
};

const people = ['Giacomo', 'Marco', 'Franci'];
const cleaningTypes: CleaningType[] = ['kitchen', 'bathroom'];

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

  let cleaningCounter = 0; // Contatore globale per l'assegnazione ciclica delle persone

  const getDayAssignment = (date: Date): CleaningAssignment | undefined => {
    const dayOfWeek = getDay(date); // 0=domenica, 1=lunedì, 2=martedì, ..., 6=sabato
  
    // Assegna solo per i giorni specifici (lunedì, martedì, venerdì, sabato)
    switch (dayOfWeek) {
      case 1: // Lunedì
      case 2: // Martedì
      case 5: // Venerdì
      case 6: // Sabato
      {
        const assignedPerson = people[cleaningCounter % people.length]; // Assegna ciclicamente
        cleaningCounter++; // Incrementa il contatore solo nei giorni di pulizia
        if (dayOfWeek === 1 || dayOfWeek === 5) {
          return { person: assignedPerson, type: 'kitchen' };
        } else {
          return { person: assignedPerson, type: 'bathroom' };
        }
      }
      default:
        return undefined; // Nessuna assegnazione per gli altri giorni
    }
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
                  h-20 border rounded-lg p-2 transition-all duration-200
                  ${isCurrentMonth ? 'bg-card' : 'bg-muted/20'}
                  ${isTodayDate ? 'ring-2 ring-primary ring-offset-2' : ''}
                  ${assignment ? cleaningTypeColors[assignment.type] : ''}
                `}
              >
                <div className="flex flex-col h-full">
                  <div className={`text-sm font-medium ${isTodayDate ? 'text-primary' : 'text-foreground'}`}>
                    {format(date, 'd')}
                  </div>
                  {assignment && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <div className="text-xs font-bold text-foreground">
                        {assignment.person}
                      </div>
                      <div className="text-xs font-medium text-foreground mt-0.5">
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