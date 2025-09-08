import React, { useState, useMemo } from 'react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus } from 'lucide-react';
import { CleaningAssignment, cleaningTypeLabels, personColors } from '@/contexts/CleaningContext';

interface MobileCalendarViewProps {
  currentDate: Date;
  assignments: CleaningAssignment[];
  onEditAssignment: (assignment: CleaningAssignment) => void;
  onDeleteAssignment: (assignment: CleaningAssignment) => void;
  onAddAssignment: (date: string) => void;
  onMoveAssignment: (id: string, newDate: string) => void;
}

const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export function MobileCalendarView({
  currentDate,
  assignments,
  onEditAssignment,
  onDeleteAssignment,
  onAddAssignment,
  onMoveAssignment,
}: MobileCalendarViewProps) {
  const [viewDate, setViewDate] = useState(currentDate);

  const weekStart = startOfWeek(viewDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(viewDate, { weekStartsOn: 1 });
  const weekDaysInterval = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weeklyAssignments = useMemo(() => {
    return weekDaysInterval.map(day => {
      const dateString = format(day, 'yyyy-MM-dd');
      return {
        date: dateString,
        assignment: assignments.find(a => a.date === dateString),
      };
    });
  }, [assignments, weekDaysInterval]);

  const previousWeek = () => {
    setViewDate(addDays(viewDate, -7));
  };

  const nextWeek = () => {
    setViewDate(addDays(viewDate, 7));
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) {
      return;
    }
    onMoveAssignment(draggableId, destination.droppableId);
  };

  return (
    <Card className="w-full md:hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">
            {format(weekStart, 'd MMM', { locale: it })} - {format(weekEnd, 'd MMM yyyy', { locale: it })}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={previousWeek} className="h-8 w-8" data-testid="previous-week-button">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextWeek} className="h-8 w-8" data-testid="next-week-button">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-2">
            {weekDaysInterval.map((day, index) => {
              const dateString = format(day, 'yyyy-MM-dd');
              const dayData = weeklyAssignments[index];
              const assignment = dayData ? dayData.assignment : undefined;
              const isTodayDate = isToday(day);

              return (
                <Droppable key={dateString} droppableId={dateString}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`
                        p-2 rounded-lg flex items-center gap-3 transition-all
                        ${isTodayDate ? 'ring-1 ring-primary' : ''}
                        ${snapshot.isDraggingOver ? 'bg-primary/10' : ''}
                        ${assignment ? personColors[assignment.person] : 'bg-muted/30'}
                      `}
                    >
                      <div className={`flex-none text-center w-10 ${isTodayDate ? 'text-primary' : 'text-black'}`}>
                        <div className="text-xs font-semibold">{format(day, 'eee', { locale: it })}</div>
                        <div className="text-lg font-bold">{format(day, 'd')}</div>
                      </div>
                      <div className="flex-grow min-h-[4rem] flex items-center justify-center">
                        {assignment ? (
                          <Draggable draggableId={assignment.id} index={0}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`
                                  w-full p-2 rounded-md shadow-sm text-center group cursor-move
                                  ${snapshot.isDragging ? 'opacity-60' : ''}
                                `}
                              >
                                <div className="font-bold text-sm text-black">{assignment.person}</div>
                                <div className="text-xs text-black">{cleaningTypeLabels[assignment.type]}</div>
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1">
                                   <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 bg-background/80 hover:bg-background"
                                    onClick={(e) => { e.stopPropagation(); onEditAssignment(assignment); }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                                    onClick={(e) => { e.stopPropagation(); onDeleteAssignment(assignment); }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ) : (
                          <div className="flex-1 flex items-center justify-center group h-full">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-50 group-hover:opacity-100 transition-opacity"
                              onClick={() => onAddAssignment(dateString)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                       {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}
