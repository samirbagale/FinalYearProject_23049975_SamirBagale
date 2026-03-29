import { MoodEntry } from '@/types'

const API_URL = 'http://127.0.0.1:5000/api/moods'

// Helper to get headers
const getHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
})

export const moodService = {
    // Get all moods
    getMoods: async (token: string): Promise<MoodEntry[]> => {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: getHeaders(token),
        })

        if (!response.ok) {
            throw new Error('Failed to fetch moods')
        }

        const data = await response.json()

        if (!data.success || !Array.isArray(data.data)) {
            return [];
        }

        return data.data.map((mood: any) => ({
            ...mood,
            id: mood._id,
            userId: mood.user,
            timestamp: new Date(mood.timestamp),
        }))
    },

    // Create new mood
    createMood: async (token: string, moodData: Partial<MoodEntry>): Promise<MoodEntry> => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify(moodData),
        })

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create mood entry')
        }

        const data = await response.json()
        const mood = data.data

        return {
            ...mood,
            id: mood._id,
            userId: mood.user,
            timestamp: new Date(mood.timestamp),
        }
    },

    // Delete mood
    deleteMood: async (token: string, id: string): Promise<void> => {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: getHeaders(token),
        })

        if (!response.ok) {
            throw new Error('Failed to delete mood entry')
        }
    },
}
