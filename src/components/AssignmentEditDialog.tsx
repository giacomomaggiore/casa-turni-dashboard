import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CleaningAssignment, people, cleaningTypes, cleaningTypeLabels } from '@/contexts/CleaningContext';

interface AssignmentEditDialogProps {
  assignment: CleaningAssignment;
  open: boolean;
  onClose: () => void;
  onSave: (assignment: CleaningAssignment) => void;
}

export function AssignmentEditDialog({ assignment, open, onClose, onSave }: AssignmentEditDialogProps) {
  const [person, setPerson] = useState(assignment.person);
  const [type, setType] = useState(assignment.type);

  useEffect(() => {
    setPerson(assignment.person);
    setType(assignment.type);
  }, [assignment]);

  const handleSave = () => {
    onSave({
      ...assignment,
      person,
      type,
    });
  };

  const handleCancel = () => {
    setPerson(assignment.person);
    setType(assignment.type);
    onClose();
  };

  const assignmentDate = new Date(assignment.date);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifica Assegnazione</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="text-sm text-muted-foreground">
            Data: {format(assignmentDate, 'dd MMMM yyyy')}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="person">Persona</Label>
            <Select value={person} onValueChange={setPerson}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona persona" />
              </SelectTrigger>
              <SelectContent>
                {people.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="type">Tipo di Pulizia</Label>
            <Select value={type} onValueChange={(value) => setType(value as 'kitchen' | 'bathroom')}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona tipo" />
              </SelectTrigger>
              <SelectContent>
                {cleaningTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {cleaningTypeLabels[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Annulla
          </Button>
          <Button onClick={handleSave}>
            Salva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 