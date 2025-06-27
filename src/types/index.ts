export interface DatePlan {
  id: string
  title: string
  description: string
  category: string
  duration: string
  cost: string
  image: string
  active: boolean
  bgGradient: string
  goodForToday: boolean
  city?: string
  relationType?: string
  experienceType?: string
  expiresAt?: string
}

export interface Connection {
  uid: string
  name: string
  relation?: string
}

// Nuevo modelo robusto para conexiones
export interface ConnectionDocument {
  id: string
  user1: string
  user2: string
  user1Name: string
  user2Name: string
  user1Relation: string
  user2Relation: string
  status: 'pending' | 'accepted' | 'blocked'
  createdAt: number
  updatedAt: number
  createdBy: string
}

export interface UserData {
  role: string
  connections: string[]
  pin: string
  displayName?: string
  email?: string
  photoURL?: string
  uid: string
}

export interface Match {
  id: string
  dateId: string
  users: string[]
  createdAt: number
  plannedFor?: string
}