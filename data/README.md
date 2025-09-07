# Data Directory

This directory contains the JSON file storage for cleaning assignments.

- `assignments.json` - Contains all cleaning assignments data
- This file is automatically created by the API when first accessed
- Data persists between API calls but resets on deployments (as intended)

## File Structure

```json
{
  "assignments": [
    {
      "id": "unique-id",
      "person": "Giacomo",
      "type": "kitchen",
      "date": "2024-01-15",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "lastUpdated": "2024-01-15T10:30:00Z"
}
``` 