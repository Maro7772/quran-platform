import { create } from "zustand";
import { persist } from "zustand/middleware";

// شكل بيانات المستخدم
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  logout: () => void;
}

// إنشاء الـ Store مع ميزة الـ persist لحفظ بيانات اليوزر في الـ LocalStorage
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false })
    }),
    {
      name: "auth-storage" // مفتاح التخزين في الـ LocalStorage (لبيانات اليوزر فقط، والتوكن آمن في الـ HttpOnly Cookie)
    }
  )
);
