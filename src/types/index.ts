// User Types
export interface User {
  id: string
  email: string
  username: string
  dateOfBirth: Date
  isAnonymous: boolean
  createdAt: Date
  intakeCompleted?: boolean
  intakeData?: IntakeQuestionnaire
}

export interface AuthUser {
  id: string
  email: string
  username: string
  role: 'user' | 'admin' | 'psychiatrist'
  isPremium?: boolean
  dateOfBirth: Date
  createdAt: Date
}

// Authentication Types
export interface SignupData {
  email: string
  username: string
  password: string
  dateOfBirth: string
  agreeToTerms: boolean
  agreeToCrisisStatement: boolean
}

export interface LoginData {
  emailOrUsername: string
  password: string
}

// Intake Questionnaire Types
export interface IntakeQuestionnaire {
  userId: string
  completedAt: Date
  currentMood?: MoodType
  concerns?: string[]
  goals?: string[]
  preferredSupportType?: 'chat' | 'listener' | 'community' | 'all'
  stressLevel?: number // 1-10
  sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent'
  socialSupport?: 'none' | 'limited' | 'moderate' | 'strong'
}

// Mood Types
export interface MoodEntry {
  id: string
  userId: string
  mood: MoodType
  intensity: number // 0-5 scale
  notes?: string
  activityTags?: string[]
  timestamp: Date
}

export type MoodType = 'happy' | 'sad' | 'anxious' | 'stressed' | 'neutral' | 'calm' | 'angry' | 'tired'

// Chat Types
export interface ChatMessage {
  id: string
  userId: string
  message: string
  sentiment?: SentimentAnalysis
  timestamp: Date
  isUser: boolean
}

export interface SentimentAnalysis {
  emotion: MoodType
  confidence: number // 0-1
  keywords: string[]
  intensity: number
}

// Wellness Types
export interface WellnessExercise {
  id: string
  type: 'breathing' | 'meditation' | 'motivational'
  title: string
  description: string
  duration?: number // in minutes
  content: string
  audioUrl?: string
}

export interface DailyTip {
  id: string
  title: string
  content: string
  category: string
  date: Date
}

// Emergency Types
export interface CrisisKeyword {
  keyword: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface HelplineResource {
  id: string
  name: string
  phone: string
  description: string
  available24h: boolean
  website?: string
}

export interface CounselingCenter {
  id: string
  name: string
  address: string
  phone: string
  distance?: number // in km
  rating?: number
}

// Premium Types
export interface VideoCallSession {
  id: string
  userId: string
  psychiatristId: string
  scheduledAt: Date
  duration: number
  status: 'scheduled' | 'completed' | 'cancelled'
}

export interface Habit {
  id: string
  userId: string
  title: string
  description: string
  frequency: 'daily' | 'weekly' | 'monthly'
  streak: number
  lastCompleted?: Date
}

// Community & Chatroom Types
export interface Chatroom {
  id: string
  name: string
  description: string
  topic: ChatroomTopic
  memberCount: number
  isActive: boolean
  createdAt: Date
  moderatorIds?: string[]
}

export type ChatroomTopic =
  | 'anxiety'
  | 'depression'
  | 'stress'
  | 'relationships'
  | 'grief'
  | 'trauma'
  | 'self-care'
  | 'motivation'
  | 'sleep'
  | 'general'

export interface ChatroomMessage {
  id: string
  chatroomId: string
  userId: string
  username: string
  message: string
  timestamp: Date
  edited?: boolean
  deleted?: boolean
}

// Forum Types
export interface ForumPost {
  id: string
  userId: string
  username: string
  title: string
  content: string
  category: ChatroomTopic
  replyCount: number
  viewCount: number
  createdAt: Date
  updatedAt?: Date
  isPinned?: boolean
  isLocked?: boolean
  lastReplyAt?: Date
}

export interface ForumReply {
  id: string
  postId: string
  userId: string
  username: string
  content: string
  createdAt: Date
  updatedAt?: Date
  edited?: boolean
  deleted?: boolean
  replyToId?: string // For nested replies
}

// Listener Types (for one-to-one chats)
export interface Listener {
  id: string
  username: string
  isOnline: boolean
  isAvailable: boolean
  rating?: number
  languages?: string[]
  specialties?: string[]
  totalConversations?: number
}

export interface OneToOneChat {
  id: string
  userId: string
  listenerId?: string
  isWithListener: boolean
  createdAt: Date
  lastMessageAt?: Date
  messages: ChatMessage[]
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

