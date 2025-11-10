import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { User as TelegramUser } from '@telegram-apps/sdk-react';

export interface User {
  id: string;
  telegram_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  role: 'user' | 'promoter' | 'manager' | 'admin';
  bio?: string;
  interests?: string[];
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  initUser: (telegramUser: TelegramUser) => Promise<void>;
  updateRole: (role: User['role']) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,

  initUser: async (telegramUser) => {
    if (get().isLoading || get().user) return; // Prevent re-runs

    set({ isLoading: true });
    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .single();

      if (existingUser) {
        set({ user: existingUser, isLoading: false });
        return;
      }
      
      // Handle case where user does not exist yet without throwing
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          telegram_id: telegramUser.id,
          username: telegramUser.username,
          first_name: telegramUser.firstName,
          last_name: telegramUser.lastName,
          photo_url: telegramUser.photoUrl,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      set({ user: newUser, isLoading: false });
    } catch (error) {
      console.error('Error initializing user:', error);
      set({ isLoading: false });
    }
  },

  updateRole: async (role) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', currentUser.id)
      .select()
      .single();

    if (!error && data) {
      set({ user: data });
    }
  },

  logout: () => {
    set({ user: null });
  },
}));
