import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { format, getDay } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { apiService } from '@/services/api';

export type CleaningType = 'kitchen' | 'bathroom';

export interface CleaningAssignment {
  id: string;
  person: string;
  type: CleaningType;
  date: string; // ISO date string
}

interface CleaningState {
  assignments: CleaningAssignment[] | null;
  loading: boolean;
  error: string | null;
}

type CleaningAction = 
  | { type: 'SET_ASSIGNMENTS'; payload: CleaningAssignment[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'API_START' }
  | { type: 'API_SUCCESS'; payload: CleaningAssignment[] }
  | { type: 'API_ERROR'; payload: string };

export const people = ['Giacomo', 'Marco', 'Franci'];
export const cleaningTypes: CleaningType[] = ['kitchen', 'bathroom'];

export const cleaningTypeLabels: Record<CleaningType, string> = {
  kitchen: 'KITCHEN',
  bathroom: 'BATHROOM'
};

export const cleaningTypeColors: Record<CleaningType, string> = {
  kitchen: 'bg-cleaning-kitchen',
  bathroom: 'bg-cleaning-bathroom'
};

const cleaningReducer = (state: CleaningState, action: CleaningAction): CleaningState => {
  switch (action.type) {
    case 'SET_ASSIGNMENTS':
      return { 
        ...state, 
        assignments: action.payload,
        loading: false,
        error: null
      };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'API_START':
      return { ...state, loading: true, error: null };
    
    case 'API_SUCCESS':
      return { 
        ...state, 
        assignments: action.payload, 
        loading: false, 
        error: null 
      };
    
    case 'API_ERROR':
      return { 
        ...state, 
        loading: false, 
        error: action.payload 
      };
    
    default:
      return state;
  }
};

// Generate default assignments based on the original logic
const generateDefaultAssignments = (): CleaningAssignment[] => {
  const assignments: CleaningAssignment[] = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  // Generate assignments for current month and next 3 months
  for (let monthOffset = 0; monthOffset < 4; monthOffset++) {
    const targetDate = new Date(currentYear, currentMonth + monthOffset, 1);
    const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
    
    let cleaningCounter = monthOffset * 16; // Approximate counter for continuity
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetDate.getFullYear(), targetDate.getMonth(), day);
      const dayOfWeek = getDay(date);
      
      // Assign only for specific days (Monday, Tuesday, Friday, Saturday)
      if ([1, 2, 5, 6].includes(dayOfWeek)) {
        const assignedPerson = people[cleaningCounter % people.length];
        const cleaningType: CleaningType = (dayOfWeek === 1 || dayOfWeek === 5) ? 'kitchen' : 'bathroom';
        
        assignments.push({
          id: uuidv4(),
          person: assignedPerson,
          type: cleaningType,
          date: format(date, 'yyyy-MM-dd')
        });
        
        cleaningCounter++;
      }
    }
  }
  
  return assignments;
};

interface CleaningContextType {
  assignments: CleaningAssignment[] | null;
  loading: boolean;
  error: string | null;
  addAssignment: (assignment: Omit<CleaningAssignment, 'id'>) => Promise<void>;
  updateAssignment: (assignment: CleaningAssignment) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  moveAssignment: (id: string, newDate: string) => Promise<void>;
  resetToDefault: () => Promise<void>;
  getAssignmentForDate: (date: string) => CleaningAssignment | undefined;
  refreshAssignments: () => Promise<void>;
}

const CleaningContext = createContext<CleaningContextType | undefined>(undefined);

export const useCleaningContext = () => {
  const context = useContext(CleaningContext);
  if (!context) {
    throw new Error('useCleaningContext must be used within a CleaningProvider');
  }
  return context;
};

interface CleaningProviderProps {
  children: ReactNode;
}

export const CleaningProvider: React.FC<CleaningProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cleaningReducer, { 
    assignments: null as CleaningAssignment[] | null, 
    loading: true, 
    error: null 
  });

  // Load assignments from API on mount
  useEffect(() => {
    refreshAssignments();
  }, []);

  const refreshAssignments = async () => {
    try {
      dispatch({ type: 'API_START' });
      const assignments = await apiService.getAllAssignments();
      dispatch({ type: 'API_SUCCESS', payload: assignments });
    } catch (error) {
      dispatch({ type: 'API_ERROR', payload: error instanceof Error ? error.message : 'Failed to load assignments' });
    }
  };

  const addAssignment = async (assignment: Omit<CleaningAssignment, 'id'>) => {
    try {
      dispatch({ type: 'API_START' });
      const assignments = await apiService.addAssignment(assignment);
      dispatch({ type: 'API_SUCCESS', payload: assignments });
    } catch (error) {
      dispatch({ type: 'API_ERROR', payload: error instanceof Error ? error.message : 'Failed to add assignment' });
      throw error;
    }
  };

  const updateAssignment = async (assignment: CleaningAssignment) => {
    try {
      dispatch({ type: 'API_START' });
      const assignments = await apiService.updateAssignment(assignment);
      dispatch({ type: 'API_SUCCESS', payload: assignments });
    } catch (error) {
      dispatch({ type: 'API_ERROR', payload: error instanceof Error ? error.message : 'Failed to update assignment' });
      throw error;
    }
  };

  const deleteAssignment = async (id: string) => {
    try {
      dispatch({ type: 'API_START' });
      const assignments = await apiService.deleteAssignment(id);
      dispatch({ type: 'API_SUCCESS', payload: assignments });
    } catch (error) {
      dispatch({ type: 'API_ERROR', payload: error instanceof Error ? error.message : 'Failed to delete assignment' });
      throw error;
    }
  };

  const moveAssignment = async (id: string, newDate: string) => {
    try {
      dispatch({ type: 'API_START' });
      const assignments = await apiService.moveAssignment(id, newDate);
      dispatch({ type: 'API_SUCCESS', payload: assignments });
    } catch (error) {
      dispatch({ type: 'API_ERROR', payload: error instanceof Error ? error.message : 'Failed to move assignment' });
      throw error;
    }
  };

  const resetToDefault = async () => {
    try {
      dispatch({ type: 'API_START' });
      const assignments = await apiService.resetToDefault();
      dispatch({ type: 'API_SUCCESS', payload: assignments });
    } catch (error) {
      dispatch({ type: 'API_ERROR', payload: error instanceof Error ? error.message : 'Failed to reset assignments' });
      throw error;
    }
  };

  const getAssignmentForDate = (date: string): CleaningAssignment | undefined => {
    return state.assignments?.find(assignment => assignment.date === date);
  };

  const contextValue: CleaningContextType = {
    assignments: state.assignments,
    loading: state.loading,
    error: state.error,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    moveAssignment,
    resetToDefault,
    getAssignmentForDate,
    refreshAssignments
  };

  return (
    <CleaningContext.Provider value={contextValue}>
      {children}
    </CleaningContext.Provider>
  );
}; 