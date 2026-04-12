const API_URL = 'http://127.0.0.1:5000/api/gratitude';

export const gratitudeService = {
  // Create a new entry
  createEntry: async (token: string, data: { q1: string, q2: string, q3: string }) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // Get current user's entries
  getMyEntries: async (token: string) => {
    const response = await fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
  },

  // Admin: Get all entries
  getAllEntries: async (token: string) => {
    const response = await fetch(`${API_URL}/admin`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
  },

  // Admin/User: Delete entry
  deleteEntry: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
  }
};
