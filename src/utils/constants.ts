export const APP_NAME = 'Mind Care'
export const APP_TAGLINE = 'AI-Powered Mental Wellness Platform'

// Mood Colors
export const MOOD_COLORS: Record<string, string> = {
  happy: '#fbbf24',
  sad: '#60a5fa',
  anxious: '#f87171',
  stressed: '#fb923c',
  neutral: '#94a3b8',
  calm: '#34d399',
  angry: '#ef4444',
  tired: '#a78bfa',
}

// Crisis Keywords
export const CRISIS_KEYWORDS = [
  { keyword: 'suicide', severity: 'critical' as const },
  { keyword: 'kill myself', severity: 'critical' as const },
  { keyword: 'end it all', severity: 'critical' as const },
  { keyword: 'no reason to live', severity: 'critical' as const },
  { keyword: 'self harm', severity: 'high' as const },
  { keyword: 'hurt myself', severity: 'high' as const },
  { keyword: 'extremely depressed', severity: 'high' as const },
  { keyword: 'cant go on', severity: 'medium' as const },
  { keyword: 'overwhelmed', severity: 'medium' as const },
]

// Default Helplines (Example - should be replaced with actual resources)
export const DEFAULT_HELPLINES = [
  {
    id: '1',
    name: 'National Suicide Prevention Lifeline',
    phone: '988',
    description: '24/7 free and confidential support',
    available24h: true,
  },
  {
    id: '2',
    name: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    description: 'Free 24/7 crisis support via text',
    available24h: true,
  },
]





