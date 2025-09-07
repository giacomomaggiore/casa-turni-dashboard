import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  Users, 
  Calendar, 
  Palette,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { 
  useCleaningContext, 
  people, 
  cleaningTypeLabels, 
  cleaningTypeColors,
  cleaningTypes
} from '@/contexts/CleaningContext';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface DashboardSidebarProps {
  currentDate: Date;
}

export function DashboardSidebar({ currentDate }: DashboardSidebarProps) {
  const { assignments, resetToDefault, loading } = useCleaningContext();

  // Don't render until assignments are loaded
  if (!assignments) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  // Calculate statistics for current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  const currentMonthAssignments = assignments?.filter(assignment => {
    const assignmentDate = new Date(assignment.date);
    return isWithinInterval(assignmentDate, { start: monthStart, end: monthEnd });
  }) || [];

  const assignmentsByPerson = people.map(person => ({
    person,
    count: currentMonthAssignments.filter(a => a.person === person).length,
    kitchen: currentMonthAssignments.filter(a => a.person === person && a.type === 'kitchen').length,
    bathroom: currentMonthAssignments.filter(a => a.person === person && a.type === 'bathroom').length,
  }));

  const totalAssignments = currentMonthAssignments.length;
  const averagePerPerson = totalAssignments / people.length;
  const isBalanced = assignmentsByPerson.every(p => Math.abs(p.count - averagePerPerson) <= 1);

  const handleResetToDefault = async () => {
    if (window.confirm('Sei sicuro di voler ripristinare le assegnazioni predefinite? Tutte le modifiche andranno perse.')) {
      try {
        await resetToDefault();
      } catch (error) {
        console.error('Failed to reset assignments:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5 text-primary" />
            Legenda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Persone
            </h4>
            <div className="space-y-1">
              {people.map((person) => (
                <div key={person} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  {person}
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-2">Tipi di Pulizia</h4>
            <div className="space-y-1">
              {cleaningTypes.map((type) => (
                <div key={type} className="flex items-center gap-2 text-sm">
                  <div className={`w-3 h-3 rounded ${cleaningTypeColors[type]}`} />
                  {cleaningTypeLabels[type]}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
            Statistiche - {format(currentDate, 'MMMM yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Totale assegnazioni:</span>
            <Badge variant="secondary">{totalAssignments}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Distribuzione:</span>
            <Badge variant={isBalanced ? "default" : "destructive"}>
              {isBalanced ? "Bilanciata" : "Non bilanciata"}
              {!isBalanced && <AlertCircle className="h-3 w-3 ml-1" />}
            </Badge>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-medium mb-2">Assegnazioni per persona</h4>
            <div className="space-y-2">
              {assignmentsByPerson.map(({ person, count, kitchen, bathroom }) => (
                <div key={person} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{person}</span>
                    <Badge variant="outline">{count} totali</Badge>
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded bg-cleaning-kitchen" />
                      {kitchen} cucina
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded bg-cleaning-bathroom" />
                      {bathroom} bagno
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-primary" />
            Azioni
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Gestisci le assegnazioni di pulizia
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResetToDefault}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Ripristina Default
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Come usare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>Trascina</strong> le assegnazioni per spostarle</p>
          <p>• <strong>Hover</strong> su un'assegnazione per vedere i pulsanti</p>
          <p>• <strong>Clicca +</strong> sui giorni vuoti per aggiungere</p>
          <p>• <strong>Clicca edit</strong> per modificare persona/tipo</p>
          <p>• <strong>Clicca trash</strong> per eliminare</p>
        </CardContent>
      </Card>
    </div>
  );
} 