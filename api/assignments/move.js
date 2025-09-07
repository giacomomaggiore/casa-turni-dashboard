import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'assignments.json');

// Load assignments from JSON file
async function loadAssignments() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      assignments: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

// Save assignments to JSON file
async function saveAssignments(data) {
  try {
    const dataDir = path.dirname(DATA_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    
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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
    return;
  }

  try {
    const { id, newDate } = req.body;
    
    if (!id || !newDate) {
      res.status(400).json({ error: 'Assignment ID and new date are required' });
      return;
    }

    const data = await loadAssignments();
    const assignmentIndex = data.assignments.findIndex(a => a.id === id);
    
    if (assignmentIndex === -1) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    // Update the assignment date
    data.assignments[assignmentIndex] = {
      ...data.assignments[assignmentIndex],
      date: newDate,
      updatedAt: new Date().toISOString()
    };

    const savedData = await saveAssignments(data);
    res.status(200).json(savedData);
    
  } catch (error) {
    console.error('Move API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
} 