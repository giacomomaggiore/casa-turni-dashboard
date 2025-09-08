import { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { format, getDay } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export type CleaningType = 'kitchen' | 'bathroom';

export interface CleaningAssignment {
  id: string;
  person: string;
  type: CleaningType;
  date: string; // ISO date string
}

interface CleaningState {
  assignments: CleaningAssignment[];
}

type CleaningAction = 
  | { type: 'SET_ASSIGNMENTS'; payload: CleaningAssignment[] }
  | { type: 'ADD_ASSIGNMENT'; payload: Omit<CleaningAssignment, 'id'> }
  | { type: 'UPDATE_ASSIGNMENT'; payload: CleaningAssignment }
  | { type: 'DELETE_ASSIGNMENT'; payload: string }
  | { type: 'MOVE_ASSIGNMENT'; payload: { id: string; newDate: string } }
  | { type: 'RESET_TO_DEFAULT' };

export const people = ['Giacomo', 'Marco', 'Franci'];
export const cleaningTypes: CleaningType[] = ['kitchen', 'bathroom'];

export const cleaningTypeLabels: Record<CleaningType, string> = {
  kitchen: 'KITCHEN',
  bathroom: 'BATHROOM'
};

export const cleaningTypeColors: Record<CleaningType, string> = {
  kitchen: 'bg-app-kitchen',
  bathroom: 'bg-app-bathroom'
};

export const personColors: Record<string, string> = {
  Giacomo: 'bg-[#E4C1F9]',
  Marco: 'bg-[#D0F4DE]',
  Franci: 'bg-[#A9DEF9]',
};

const cleaningReducer = (state: CleaningState, action: CleaningAction): CleaningState => {
  switch (action.type) {
    case 'SET_ASSIGNMENTS':
      return { assignments: action.payload };
    
    case 'ADD_ASSIGNMENT': {
      const newAssignment: CleaningAssignment = {
        ...action.payload,
        id: uuidv4()
      };
      return { assignments: [...state.assignments, newAssignment] };
    }
    
    case 'UPDATE_ASSIGNMENT':
      return {
        assignments: state.assignments.map(assignment =>
          assignment.id === action.payload.id ? action.payload : assignment
        )
      };
    
    case 'DELETE_ASSIGNMENT':
      return {
        assignments: state.assignments.filter(assignment => assignment.id !== action.payload)
      };
    
    case 'MOVE_ASSIGNMENT':
      return {
        assignments: state.assignments.map(assignment =>
          assignment.id === action.payload.id 
            ? { ...assignment, date: action.payload.newDate }
            : assignment
        )
      };
    
    case 'RESET_TO_DEFAULT':
      return { assignments: generateDefaultAssignments() };
    
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
  assignments: CleaningAssignment[];
  addAssignment: (assignment: Omit<CleaningAssignment, 'id'>) => void;
  updateAssignment: (assignment: CleaningAssignment) => void;
  deleteAssignment: (id:string) => void;
  moveAssignment: (id: string, newDate: string) => void;
  resetToDefault: () => void;
  getAssignmentsForDate: (date: string) => CleaningAssignment[];
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
  const [state, dispatch] = useReducer(cleaningReducer, { assignments: [] });
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load from API on mount
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch('/api/turni');
        if (response.ok) {
          const assignments = await response.json();
          if (assignments && assignments.length > 0) {
            dispatch({ type: 'SET_ASSIGNMENTS', payload: assignments });
          } else {
            // If the server returns an empty array, generate default assignments
            dispatch({ type: 'RESET_TO_DEFAULT' });
          }
        } else {
          // If the API fails, generate default assignments
          console.error('Failed to load assignments from API');
          dispatch({ type: 'RESET_TO_DEFAULT' });
        }
      } catch (error) {
        console.error('Failed to load assignments from API:', error);
        dispatch({ type: 'RESET_TO_DEFAULT' });
      } finally {
        setIsInitialLoad(false);
      }
    };

    fetchAssignments();
  }, []);

  // Save to API whenever assignments change
  useEffect(() => {
    // Avoid saving to API on the initial load or if assignments are empty
    if (isInitialLoad || state.assignments.length === 0) {
      return;
    }

    const saveAssignments = async () => {
      try {
        await fetch('/api/turni', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(state.assignments),
        });
      } catch (error) {
        console.error('Failed to save assignments to API:', error);
      }
    };

    saveAssignments();
  }, [state.assignments, isInitialLoad]);

  const addAssignment = (assignment: Omit<CleaningAssignment, 'id'>) => {
    dispatch({ type: 'ADD_ASSIGNMENT', payload: assignment });
  };

  const updateAssignment = (assignment: CleaningAssignment) => {
    dispatch({ type: 'UPDATE_ASSIGNMENT', payload: assignment });
  };

  const deleteAssignment = (id: string) => {
    dispatch({ type: 'DELETE_ASSIGNMENT', payload: id });
  };

  const moveAssignment = (id: string, newDate: string) => {
    dispatch({ type: 'MOVE_ASSIGNMENT', payload: { id, newDate } });
  };

  const resetToDefault = () => {
    dispatch({ type: 'RESET_TO_DEFAULT' });
  };

  const getAssignmentsForDate = (date: string): CleaningAssignment[] => {
    return state.assignments.filter(assignment => assignment.date === date);
  };

  const contextValue: CleaningContextType = {
    assignments: state.assignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    moveAssignment,
    resetToDefault,
    getAssignmentsForDate
  };

  return (
    <CleaningContext.Provider value={contextValue}>
      {children}
    </CleaningContext.Provider>
  );
}; 