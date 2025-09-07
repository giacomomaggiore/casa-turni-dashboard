import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'assignments.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load assignments from JSON file
async function loadAssignments() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return default structure
    return {
      assignments: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

// Save assignments to JSON file
async function saveAssignments(data) {
  try {
    await ensureDataDir();
    const dataToSave = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(dataToSave, null, 2), 'utf8');
    return dataToSave;
  } catch (error) {
    console.error('Error saving assignments:', error);
    throw new Error('Failed to save assignments');
  }
}

// Generate default assignments (same logic as frontend)
function generateDefaultAssignments() {
  const assignments = [];
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
        const cleaningType = (dayOfWeek === 1 || dayOfWeek === 5) ? 'kitchen' : 'bathroom';
        
        assignments.push({
          id: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}-${cleaningCounter}`,
          person: assignedPerson,
          type: cleaningType,
          date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        });
        
        cleaningCounter++;
      }
    }
  }
  
  return assignments;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        // Get all assignments
        const data = await loadAssignments();
        
        // If no assignments exist, generate default ones
        if (data.assignments.length === 0) {
          const defaultAssignments = generateDefaultAssignments();
          const newData = await saveAssignments({ assignments: defaultAssignments });
          res.status(200).json(newData);
        } else {
          res.status(200).json(data);
        }
        break;

      case 'POST':
        // Add new assignment
        const currentData = await loadAssignments();
        const newAssignment = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...req.body,
          createdAt: new Date().toISOString()
        };
        
        currentData.assignments.push(newAssignment);
        const savedData = await saveAssignments(currentData);
        res.status(201).json(savedData);
        break;

      case 'PUT':
        // Update assignment
        const { id } = req.query;
        if (!id) {
          res.status(400).json({ error: 'Assignment ID is required' });
          return;
        }

        const dataToUpdate = await loadAssignments();
        const assignmentIndex = dataToUpdate.assignments.findIndex(a => a.id === id);
        
        if (assignmentIndex === -1) {
          res.status(404).json({ error: 'Assignment not found' });
          return;
        }

        dataToUpdate.assignments[assignmentIndex] = {
          ...dataToUpdate.assignments[assignmentIndex],
          ...req.body,
          updatedAt: new Date().toISOString()
        };

        const updatedData = await saveAssignments(dataToUpdate);
        res.status(200).json(updatedData);
        break;

      case 'DELETE':
        // Delete assignment
        const { id: deleteId } = req.query;
        if (!deleteId) {
          res.status(400).json({ error: 'Assignment ID is required' });
          return;
        }

        const dataToDelete = await loadAssignments();
        dataToDelete.assignments = dataToDelete.assignments.filter(a => a.id !== deleteId);
        
        const deletedData = await saveAssignments(dataToDelete);
        res.status(200).json(deletedData);
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']);
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
} 