import { useState } from 'react';
import { InteractiveCleaningCalendar } from '@/components/InteractiveCleaningCalendar';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { CleaningProvider } from '@/contexts/CleaningContext';

const Index = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <CleaningProvider>
      <div className="min-h-screen bg-background">
        <header className="py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold text-center text-foreground">
              Dashboard Turni di Pulizia - Zurlindenstrasse
            </h1>
            <p className="text-center text-muted-foreground mt-2">
              Gestisci e modifica i turni di pulizia in modo interattivo
            </p>
          </div>
        </header>
        
        <main className="container mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 lg:flex lg:gap-6 lg:items-stretch">
            {/* Sidebar */}
            <div className="lg:w-1/4 order-2 lg:order-1">
              <DashboardSidebar currentDate={currentDate} />
            </div>
            
            {/* Main Calendar */}
            <div className="lg:w-3/4 order-1 lg:order-2">
              <InteractiveCleaningCalendar onDateChange={setCurrentDate} />
            </div>
          </div>
        </main>
      </div>
    </CleaningProvider>
  );
};

export default Index;
