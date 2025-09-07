import { DashboardHeader } from '@/components/DashboardHeader';
import { CleaningCalendar } from '@/components/CleaningCalendar';
import { CleaningLegend } from '@/components/CleaningLegend';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <CleaningCalendar />
        <CleaningLegend />
      </main>
    </div>
  );
};

export default Index;
