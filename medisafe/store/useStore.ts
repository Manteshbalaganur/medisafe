import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  purpose: string;
  instructions: string;
  warnings: string[];
  sideEffects: string[];
}

export interface Interaction {
  medicines: string[];
  description: string;
  severity: "High" | "Medium" | "Low";
}

export interface Prescription {
  id: string;
  dateAdded: string;
  doctorName?: string;
  prescriptionDate?: string;
  overallScore: "Safe" | "Caution" | "Risk";
  fullExplanation: string;
  medicines: Medicine[];
  interactions: Interaction[];
}

export interface Reminder {
  id: string;
  medicineId: string;
  medicineName: string;
  prescriptionId: string;
  enabled: boolean;
  time: string;
  frequency: string;
  photoVerified?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  dob: string;
  notifications: {
    email: boolean;
    push: boolean;
  };
  dataSharing: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

interface AppState {
  profile: UserProfile;
  prescriptions: Prescription[];
  reminders: Reminder[];
  chatHistory: ChatMessage[];
  isLoading: boolean;
  
  // Actions
  updateProfile: (updates: Partial<UserProfile>) => void;
  addPrescription: (prescription: Prescription) => void;
  deletePrescription: (id: string) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  setLoading: (loading: boolean) => void;
}

const defaultProfile: UserProfile = {
  name: "John Doe",
  email: "john@example.com",
  phone: "+1 (555) 123-4567",
  dob: "1990-05-15",
  notifications: { email: true, push: true },
  dataSharing: true,
  theme: 'auto',
  language: 'English',
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      prescriptions: [],
      reminders: [],
      chatHistory: [],
      isLoading: false,

      updateProfile: (updates) => set((state) => ({ 
        profile: { ...state.profile, ...updates } 
      })),
      
      addPrescription: (prescription) => set((state) => {
        // Also automatically create reminders for each medicine
        const newReminders: Reminder[] = prescription.medicines.map(med => ({
          id: Math.random().toString(36).substring(7),
          medicineId: med.id,
          medicineName: med.name,
          prescriptionId: prescription.id,
          enabled: true,
          time: "08:00", // Default morning time
          frequency: med.frequency,
        }));
        
        return {
          prescriptions: [prescription, ...state.prescriptions],
          reminders: [...newReminders, ...state.reminders]
        };
      }),
      
      deletePrescription: (id) => set((state) => ({
        prescriptions: state.prescriptions.filter(p => p.id !== id),
        reminders: state.reminders.filter(r => r.prescriptionId !== id)
      })),

      updateReminder: (id, updates) => set((state) => ({
        reminders: state.reminders.map(r => r.id === id ? { ...r, ...updates } : r)
      })),

      addChatMessage: (msg) => set((state) => ({
        chatHistory: [
          ...state.chatHistory, 
          { ...msg, id: Math.random().toString(36).substring(7), timestamp: new Date().toISOString() }
        ]
      })),

      clearChat: () => set({ chatHistory: [] }),
      
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'medisafe-storage', // localStorage key
    }
  )
);
