import { MoodType } from '@/types'

/**
 * Format date to readable string
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

/**
 * Format date and time
 */
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/**
 * Get mood emoji
 */
export const getMoodEmoji = (mood: MoodType): string => {
  const emojiMap: Record<MoodType, string> = {
    happy: '😊',
    sad: '😢',
    anxious: '😰',
    stressed: '😟',
    neutral: '😐',
    calm: '😌',
    angry: '😠',
    tired: '😴',
  }
  return emojiMap[mood] || '😐'
}

/**
 * Get mood label
 */
export const getMoodLabel = (mood: MoodType): string => {
  return mood.charAt(0).toUpperCase() + mood.slice(1)
}

/**
 * Check if text contains crisis keywords
 */
export const detectCrisisKeywords = (text: string): boolean => {
  const lowerText = text.toLowerCase()
  const crisisPatterns = [
    'suicide',
    'kill myself',
    'end it all',
    'no reason to live',
    'self harm',
    'hurt myself',
    'extremely depressed',
  ]
  return crisisPatterns.some((pattern) => lowerText.includes(pattern))
}

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}





