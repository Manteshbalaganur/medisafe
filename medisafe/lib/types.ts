export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  dateOfBirth?: string;
  phone?: string;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  warnings: string[];
  interactions?: string[];
}

export interface Prescription {
  id: string;
  userId: string;
  doctorName: string;
  hospitalName: string;
  date: string;
  medicines: Medicine[];
  notes?: string;
  riskLevel: 'low' | 'moderate' | 'high';
  imageUrl?: string;
}

export interface Reminder {
  id: string;
  userId: string;
  medicineId: string;
  medicineName: string;
  time: string;
  days: string[];
  enabled: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
