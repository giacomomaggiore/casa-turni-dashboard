import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday } from 'date-fns';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus } from 'lucide-react';
import { useCleaningContext, CleaningAssignment, cleaningTypeLabels, personColors } from '@/contexts/CleaningContext';

const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

interface DesktopCalendarViewProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onEditAssignment: (assignment: CleaningAssignment) => void;
  onDeleteAssignment: (assignment: CleaningAssignment) => void;
  onAddAssignment: (date: string) => void;
  onMoveAssignment: (id: string, newDate: string) => void;
}

export function DesktopCalendarView({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onEditAssignment,
  onDeleteAssignment,
  onAddAssignment,
  onMoveAssignment,
}: DesktopCalendarViewProps) {
  const { getAssignmentsForDate } = useCleaningContext();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDay = getDay(monthStart);
  const emptyDays = startDay === 0 ? 6 : startDay - 1;

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination || destination.droppableId === source.droppableId) {
      return;
    }
    onMoveAssignment(draggableId, destination.droppableId);
  };

  return (
    <Card className="w-full hidden md:block">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            {format(currentDate, 'MMMM yyyy')}
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
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekDays.map((day) => (
            <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: emptyDays }).map((_, index) => (
              <div key={`empty-${index}`} className="h-24" />
            ))}
            {calendarDays.map((date) => {
              const dateString = format(date, 'yyyy-MM-dd');
              const assignments = getAssignmentsForDate(dateString);
              const isCurrentMonth = isSameMonth(date, currentDate);
              const isTodayDate = isToday(date);

              return (
                <Droppable key={dateString} droppableId={dateString}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`
                        h-32 lg:h-36 border rounded-lg p-2 transition-all duration-200 relative flex flex-col
                        ${isTodayDate ? 'ring-2 ring-primary ring-offset-2' : ''}
                        ${snapshot.isDraggingOver ? 'bg-primary/10 border-primary' : ''}
                        ${isCurrentMonth ? 'bg-card' : 'bg-muted/20'}
                      `}
                    >
                      <div className={`text-sm md:text-base font-medium ${isTodayDate ? 'text-primary' : 'text-black'}`}>
                        {format(date, 'd')}
                      </div>

                      <div className={`flex-1 mt-1 ${assignments.length > 1 ? 'grid grid-cols-2 gap-1' : 'flex'}`}>
                        {assignments.map((assignment, index) => (
                          <Draggable key={assignment.id} draggableId={assignment.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`
                                  ${assignments.length > 1 ? 'p-1 text-xs' : 'flex-1 flex-col items-center justify-center p-2'}
                                  rounded-md text-center group cursor-move
                                  relative
                                  ${personColors[assignment.person]}
                                  ${snapshot.isDragging ? 'opacity-60' : ''}
                                `}
                              >
                                <div className="font-bold text-black truncate">{assignment.person}</div>
                                <div className="font-medium text-black truncate">{cleaningTypeLabels[assignment.type]}</div>

                                <div className={`absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 flex gap-0.5
                                  ${assignments.length === 1 ? 'p-2' : ''}
                                `}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 bg-background/70 hover:bg-background"
                                    onClick={(e) => { e.stopPropagation(); onEditAssignment(assignment); }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 bg-background/70 hover:bg-destructive hover:text-destructive-foreground"
                                    onClick={(e) => { e.stopPropagation(); onDeleteAssignment(assignment); }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>

                      <div className="absolute bottom-1 right-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => onAddAssignment(dateString)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
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
