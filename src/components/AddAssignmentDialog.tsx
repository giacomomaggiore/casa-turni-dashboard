import React, { useState } from 'react';
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
import { people, cleaningTypes, cleaningTypeLabels, CleaningType } from '@/contexts/CleaningContext';

interface AddAssignmentDialogProps {
  date: string;
  open: boolean;
  onClose: () => void;
  onSave: (assignment: { person: string; type: CleaningType; date: string }) => void;
}

export function AddAssignmentDialog({ date, open, onClose, onSave }: AddAssignmentDialogProps) {
  const [person, setPerson] = useState<string>('');
  const [type, setType] = useState<CleaningType | ''>('');

  const handleSave = () => {
    if (person && type) {
      onSave({
        person,
        type: type as CleaningType,
        date,
      });
      // Reset form
      setPerson('');
      setType('');
    }
  };

  const handleCancel = () => {
    setPerson('');
    setType('');
    onClose();
  };

  const isValid = person && type;
  const assignmentDate = new Date(date);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Aggiungi Assegnazione</DialogTitle>
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
            <Select value={type} onValueChange={(value) => setType(value as CleaningType)}>
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
          <Button onClick={handleSave} disabled={!isValid}>
            Aggiungi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 