import React from 'react';
import { Home, Calendar, Users, Sparkles } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className="relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-90"
        style={{ background: 'var(--gradient-hero)' }}
      />
      <div className="relative px-6 py-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
            <Home className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold">Dashboard Pulizie Casa</h1>
        </div>
        <p className="text-white/90 text-lg">
          Gestisci i turni di pulizia domestica con facilità
        </p>
        
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-white/90">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Calendario Mensile</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Users className="h-4 w-4" />
            <span className="text-sm">Assegnazioni Personali</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">Codifica Colori</span>
          </div>
        </div>
      </div>
    </header>
  );
}