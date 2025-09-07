import { CleaningCalendar } from '@/components/CleaningCalendar';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-foreground">Zurlindenstrasse Cleanings</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 pb-8">
        <CleaningCalendar />
      </main>
    </div>
  );
};

export default Index;
