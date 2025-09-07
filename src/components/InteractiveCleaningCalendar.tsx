import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday } from 'date-fns';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Edit, Trash2, Plus } from 'lucide-react';
import { useCleaningContext, CleaningAssignment, cleaningTypeLabels, cleaningTypeColors } from '@/contexts/CleaningContext';
import { AssignmentEditDialog } from '@/components/AssignmentEditDialog';
import { AddAssignmentDialog } from '@/components/AddAssignmentDialog';

const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

interface InteractiveCleaningCalendarProps {
  onDateChange?: (date: Date) => void;
}

export function InteractiveCleaningCalendar({ onDateChange }: InteractiveCleaningCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingAssignment, setEditingAssignment] = useState<CleaningAssignment | null>(null);
  const [addingToDate, setAddingToDate] = useState<string | null>(null);
  
  const { 
    getAssignmentForDate, 
    moveAssignment, 
    deleteAssignment, 
    updateAssignment,
    addAssignment,
    loading,
    error,
    assignments
  } = useCleaningContext();

  // Don't render calendar until assignments are loaded
  if (!assignments) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm">Caricamento calendario...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add empty days at the beginning to align with Monday
  const startDay = getDay(monthStart);
  const emptyDays = startDay === 0 ? 6 : startDay - 1;

  const previousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    try {
      // Move assignment to new date
      await moveAssignment(draggableId, destination.droppableId);
    } catch (error) {
      console.error('Failed to move assignment:', error);
    }
  };

  const handleEditAssignment = (assignment: CleaningAssignment) => {
    setEditingAssignment(assignment);
  };

  const handleDeleteAssignment = async (assignment: CleaningAssignment) => {
    if (window.confirm(`Sei sicuro di voler eliminare l'assegnazione di ${assignment.person} per ${cleaningTypeLabels[assignment.type]}?`)) {
      try {
        await deleteAssignment(assignment.id);
      } catch (error) {
        console.error('Failed to delete assignment:', error);
      }
    }
  };

  const handleAddAssignment = (date: string) => {
    setAddingToDate(date);
  };

  const handleSaveEdit = async (updatedAssignment: CleaningAssignment) => {
    try {
      await updateAssignment(updatedAssignment);
      setEditingAssignment(null);
    } catch (error) {
      console.error('Failed to update assignment:', error);
    }
  };

  const handleSaveAdd = async (newAssignment: { person: string; type: 'kitchen' | 'bathroom'; date: string }) => {
    try {
      await addAssignment(newAssignment);
      setAddingToDate(null);
    } catch (error) {
      console.error('Failed to add assignment:', error);
    }
  };

  return (
    <>
      <Card className="w-full relative">
        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm">Caricamento...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              {format(currentDate, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={previousMonth}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextMonth}
                className="h-8 w-8"
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
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: emptyDays }).map((_, index) => (
                <div key={`empty-${index}`} className="h-24" />
              ))}
              {calendarDays.map((date) => {
                const dateString = format(date, 'yyyy-MM-dd');
                const assignment = getAssignmentForDate(dateString);
                const isCurrentMonth = isSameMonth(date, currentDate);
                const isTodayDate = isToday(date);

                return (
                  <Droppable key={dateString} droppableId={dateString}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`
                          h-24 border rounded-lg p-2 transition-all duration-200 relative
                          ${isCurrentMonth ? 'bg-card' : 'bg-muted/20'}
                          ${isTodayDate ? 'ring-2 ring-primary ring-offset-2' : ''}
                          ${snapshot.isDraggingOver ? 'bg-primary/10 border-primary' : ''}
                          ${assignment ? cleaningTypeColors[assignment.type] : ''}
                        `}
                      >
                        <div className="flex flex-col h-full">
                          <div className={`text-sm font-medium ${isTodayDate ? 'text-primary' : 'text-foreground'}`}>
                            {format(date, 'd')}
                          </div>
                          
                          {assignment ? (
                            <Draggable draggableId={assignment.id} index={0}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`
                                    flex-1 flex flex-col items-center justify-center text-center group cursor-move
                                    ${snapshot.isDragging ? 'opacity-50' : ''}
                                  `}
                                >
                                  <div className="text-xs font-bold text-foreground">
                                    {assignment.person}
                                  </div>
                                  <div className="text-xs font-medium text-foreground mt-0.5">
                                    {cleaningTypeLabels[assignment.type]}
                                  </div>
                                  
                                  {/* Action buttons - show on hover */}
                                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 bg-background/80 hover:bg-background"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditAssignment(assignment);
                                      }}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5 bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteAssignment(assignment);
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ) : (
                            <div className="flex-1 flex items-center justify-center group">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleAddAssignment(dateString)}
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

      {/* Edit Assignment Dialog */}
      {editingAssignment && (
        <AssignmentEditDialog
          assignment={editingAssignment}
          open={!!editingAssignment}
          onClose={() => setEditingAssignment(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Add Assignment Dialog */}
      {addingToDate && (
        <AddAssignmentDialog
          date={addingToDate}
          open={!!addingToDate}
          onClose={() => setAddingToDate(null)}
          onSave={handleSaveAdd}
        />
      )}
    </>
  );
} 