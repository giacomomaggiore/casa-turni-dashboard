import { CleaningAssignment, CleaningType } from '@/contexts/CleaningContext';
import { format, getDay } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Same domain in production
  : 'http://localhost:3000'; // Development (but won't work with Vite)

interface ApiResponse {
  assignments: CleaningAssignment[];
  lastUpdated: string;
}

// Generate default assignments (same logic as backend)
function generateDefaultAssignments(): CleaningAssignment[] {
  const assignments: CleaningAssignment[] = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  const people = ['Giacomo', 'Marco', 'Franci'];
  
  // Generate assignments for current month and next 3 months
  for (let monthOffset = 0; monthOffset < 4; monthOffset++) {
    const targetDate = new Date(currentYear, currentMonth + monthOffset, 1);
    const daysInMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
    
    let cleaningCounter = monthOffset * 16; // Approximate counter for continuity
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetDate.getFullYear(), targetDate.getMonth(), day);
      const dayOfWeek = date.getDay();
      
      // Assign only for specific days (Monday=1, Tuesday=2, Friday=5, Saturday=6)
      if ([1, 2, 5, 6].includes(dayOfWeek)) {
        const assignedPerson = people[cleaningCounter % people.length];
        const cleaningType: CleaningType = (dayOfWeek === 1 || dayOfWeek === 5) ? 'kitchen' : 'bathroom';
        
        assignments.push({
          id: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}-${cleaningCounter}`,
          person: assignedPerson,
          type: cleaningType,
          date: format(date, 'yyyy-MM-dd')
        });
        
        cleaningCounter++;
      }
    }
  }
  
  return assignments;
}

// LocalStorage fallback for development
class LocalStorageService {
  private readonly STORAGE_KEY = 'cleaning-assignments';

  private getStoredData(): { assignments: CleaningAssignment[]; lastUpdated: string } {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    
    // Return default data if nothing stored
    const defaultAssignments = generateDefaultAssignments();
    const defaultData = {
      assignments: defaultAssignments,
      lastUpdated: new Date().toISOString()
    };
    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(data: { assignments: CleaningAssignment[]; lastUpdated: string }): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  async getAllAssignments(): Promise<CleaningAssignment[]> {
    const data = this.getStoredData();
    return data.assignments;
  }

  async addAssignment(assignment: Omit<CleaningAssignment, 'id'>): Promise<CleaningAssignment[]> {
    const data = this.getStoredData();
    const newAssignment: CleaningAssignment = {
      ...assignment,
      id: uuidv4()
    };
    data.assignments.push(newAssignment);
    data.lastUpdated = new Date().toISOString();
    this.saveData(data);
    return data.assignments;
  }

  async updateAssignment(assignment: CleaningAssignment): Promise<CleaningAssignment[]> {
    const data = this.getStoredData();
    const index = data.assignments.findIndex(a => a.id === assignment.id);
    if (index !== -1) {
      data.assignments[index] = assignment;
      data.lastUpdated = new Date().toISOString();
      this.saveData(data);
    }
    return data.assignments;
  }

  async deleteAssignment(id: string): Promise<CleaningAssignment[]> {
    const data = this.getStoredData();
    data.assignments = data.assignments.filter(a => a.id !== id);
    data.lastUpdated = new Date().toISOString();
    this.saveData(data);
    return data.assignments;
  }

  async moveAssignment(id: string, newDate: string): Promise<CleaningAssignment[]> {
    const data = this.getStoredData();
    const index = data.assignments.findIndex(a => a.id === id);
    if (index !== -1) {
      data.assignments[index].date = newDate;
      data.lastUpdated = new Date().toISOString();
      this.saveData(data);
    }
    return data.assignments;
  }

  async resetToDefault(): Promise<CleaningAssignment[]> {
    const defaultAssignments = generateDefaultAssignments();
    const data = {
      assignments: defaultAssignments,
      lastUpdated: new Date().toISOString()
    };
    this.saveData(data);
    return data.assignments;
  }
}

// API Service for production
class ApiService {
  private async fetchWithErrorHandling(url: string, options?: RequestInit): Promise<any> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getAllAssignments(): Promise<CleaningAssignment[]> {
    const data: ApiResponse = await this.fetchWithErrorHandling(`${API_BASE_URL}/api/assignments`);
    return data.assignments;
  }

  async addAssignment(assignment: Omit<CleaningAssignment, 'id'>): Promise<CleaningAssignment[]> {
    const data: ApiResponse = await this.fetchWithErrorHandling(`${API_BASE_URL}/api/assignments`, {
      method: 'POST',
      body: JSON.stringify(assignment),
    });
    return data.assignments;
  }

  async updateAssignment(assignment: CleaningAssignment): Promise<CleaningAssignment[]> {
    const data: ApiResponse = await this.fetchWithErrorHandling(
      `${API_BASE_URL}/api/assignments?id=${assignment.id}`,
      {
        method: 'PUT',
        body: JSON.stringify(assignment),
      }
    );
    return data.assignments;
  }

  async deleteAssignment(id: string): Promise<CleaningAssignment[]> {
    const data: ApiResponse = await this.fetchWithErrorHandling(
      `${API_BASE_URL}/api/assignments?id=${id}`,
      {
        method: 'DELETE',
      }
    );
    return data.assignments;
  }

  async moveAssignment(id: string, newDate: string): Promise<CleaningAssignment[]> {
    const data: ApiResponse = await this.fetchWithErrorHandling(
      `${API_BASE_URL}/api/assignments/move`,
      {
        method: 'POST',
        body: JSON.stringify({ id, newDate }),
      }
    );
    return data.assignments;
  }

  async resetToDefault(): Promise<CleaningAssignment[]> {
    // Delete all assignments and fetch fresh defaults
    const currentAssignments = await this.getAllAssignments();
    
    // Delete all existing assignments
    for (const assignment of currentAssignments) {
      await this.deleteAssignment(assignment.id);
    }
    
    // Fetch will auto-generate defaults when empty
    return await this.getAllAssignments();
  }
}

// Export the appropriate service based on environment
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopmentWithAPI = !isProduction && typeof window !== 'undefined' && window.location.hostname !== 'localhost';

export const apiService = (isProduction || isDevelopmentWithAPI) 
  ? new ApiService() 
  : new LocalStorageService(); 