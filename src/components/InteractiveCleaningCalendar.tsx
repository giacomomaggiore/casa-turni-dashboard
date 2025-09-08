import React, { useState, useMemo } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileCalendarView } from './MobileCalendarView';
import { DesktopCalendarView } from './DesktopCalendarView';
import { useCleaningContext, CleaningAssignment } from '@/contexts/CleaningContext';
import { AssignmentEditDialog } from '@/components/AssignmentEditDialog';
import { AddAssignmentDialog } from '@/components/AddAssignmentDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TodoListView } from './TodoListView';

interface InteractiveCleaningCalendarProps {
  onDateChange?: (date: Date) => void;
}

export function InteractiveCleaningCalendar({ onDateChange }: InteractiveCleaningCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingAssignment, setEditingAssignment] = useState<CleaningAssignment | null>(null);
  const [addingToDate, setAddingToDate] = useState<string | null>(null);

  const isMobile = useIsMobile();

  const {
    assignments,
    moveAssignment,
    deleteAssignment,
    updateAssignment,
    addAssignment
  } = useCleaningContext();

  const monthlyAssignments = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return assignments.filter(a => {
      const assignmentDate = new Date(a.date);
      return assignmentDate >= monthStart && assignmentDate <= monthEnd;
    });
  }, [assignments, currentDate]);

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

  const handleEditAssignment = (assignment: CleaningAssignment) => {
    setEditingAssignment(assignment);
  };

  const handleDeleteAssignment = (assignment: CleaningAssignment) => {
    if (window.confirm(`Sei sicuro di voler eliminare l'assegnazione di ${assignment.person}?`)) {
      deleteAssignment(assignment.id);
    }
  };

  const handleAddAssignment = (date: string) => {
    setAddingToDate(date);
  };

  const handleSaveEdit = (updatedAssignment: CleaningAssignment) => {
    updateAssignment(updatedAssignment);
    setEditingAssignment(null);
  };

  const handleSaveAdd = (newAssignment: { person: string; type: 'kitchen' | 'bathroom'; date: string }) => {
    addAssignment(newAssignment);
    setAddingToDate(null);
  };

  return (
    <>
      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendar">Calendario</TabsTrigger>
          <TabsTrigger value="todolist">Lista Spesa</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar">
          {isMobile ? (
            <MobileCalendarView
              currentDate={currentDate}
              assignments={monthlyAssignments}
              onPreviousMonth={previousMonth}
              onNextMonth={nextMonth}
              onEditAssignment={handleEditAssignment}
              onDeleteAssignment={handleDeleteAssignment}
              onAddAssignment={handleAddAssignment}
              onMoveAssignment={moveAssignment}
            />
          ) : (
            <DesktopCalendarView
              currentDate={currentDate}
              onPreviousMonth={previousMonth}
              onNextMonth={nextMonth}
              onEditAssignment={handleEditAssignment}
              onDeleteAssignment={handleDeleteAssignment}
              onAddAssignment={handleAddAssignment}
              onMoveAssignment={moveAssignment}
            />
          )}
        </TabsContent>
        <TabsContent value="todolist">
          <TodoListView />
        </TabsContent>
      </Tabs>



      {/* Dialogs remain in the parent component to be shared */}
      {editingAssignment && (
        <AssignmentEditDialog
          assignment={editingAssignment}
          open={!!editingAssignment}
          onClose={() => setEditingAssignment(null)}
          onSave={handleSaveEdit}
        />
      )}

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