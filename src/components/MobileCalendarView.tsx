import React from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus } from 'lucide-react';
import { CleaningAssignment, cleaningTypeLabels, cleaningTypeColors } from '@/contexts/CleaningContext';

interface MobileCalendarViewProps {
  currentDate: Date;
  assignments: CleaningAssignment[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onEditAssignment: (assignment: CleaningAssignment) => void;
  onDeleteAssignment: (assignment: CleaningAssignment) => void;
  onAddAssignment: (date: string) => void;
}

export function MobileCalendarView({
  currentDate,
  assignments,
  onPreviousMonth,
  onNextMonth,
  onEditAssignment,
  onDeleteAssignment,
  onAddAssignment,
}: MobileCalendarViewProps) {
  // Sort assignments by date for a chronological list view
  const sortedAssignments = [...assignments].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Card className="w-full md:hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            {format(currentDate, 'MMMM yyyy', { locale: it })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={onPreviousMonth} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={onNextMonth} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedAssignments.length > 0 ? (
          <div className="space-y-3">
            {sortedAssignments.map((assignment) => (
              <div key={assignment.id} className={`p-3 rounded-lg flex items-center gap-4 ${cleaningTypeColors[assignment.type]}`}>
                <div className="flex-none text-center w-12">
                  <div className="text-sm font-semibold">{format(new Date(assignment.date), 'eee', { locale: it })}</div>
                  <div className="text-xl font-bold">{format(new Date(assignment.date), 'd')}</div>
                </div>
                <div className="flex-grow">
                  <div className="font-bold">{assignment.person}</div>
                  <div className="text-sm">{cleaningTypeLabels[assignment.type]}</div>
                </div>
                <div className="flex-none flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-background/80 hover:bg-background"
                    onClick={() => onEditAssignment(assignment)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => onDeleteAssignment(assignment)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nessun turno assegnato per questo mese.
          </div>
        )}
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => onAddAssignment(format(new Date(), 'yyyy-MM-dd'))}
        >
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi Turno
        </Button>
      </CardContent>
    </Card>
  );
}
