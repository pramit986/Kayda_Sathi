// ============================================================
// Kayda Sathi — Authentication Store
// ============================================================
// Supports persistent citizen profile, quick guest/demo sign in,
// phone OTP, and email/password login.

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';

const STORAGE_AUTH_USER_KEY = '@kayda_sathi_auth_user_v1';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const DEFAULT_DEMO_USER: User = {
  id: 'user-rahul-sharma',
  displayName: 'Rahul Sharma',
  email: 'rahul.sharma@email.com',
  phone: '+91 98765 43210',
  preferredLanguage: 'en',
  createdAt: '2025-10-01T10:00:00.000Z',
};

let currentUser: User | null = null;
let isLoaded = false;
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach(fn => fn());
}

export const AuthStore = {
  async init() {
    if (isLoaded) return;
    try {
      const stored = await AsyncStorage.getItem(STORAGE_AUTH_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) {
          currentUser = parsed;
        }
      } else {
        // Default to demo citizen for seamless hackathon walkthrough
        currentUser = DEFAULT_DEMO_USER;
        await AsyncStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(DEFAULT_DEMO_USER));
      }
    } catch (e) {
      console.warn('AuthStore init error:', e);
      currentUser = DEFAULT_DEMO_USER;
    } finally {
      isLoaded = true;
      notify();
    }
  },

  getUser(): User | null {
    return currentUser;
  },

  isAuthenticated(): boolean {
    return Boolean(currentUser);
  },

  async login(user: Partial<User>): Promise<User> {
    const fullUser: User = {
      id: user.id || `user-${Date.now().toString(36)}`,
      displayName: user.displayName || 'Citizen',
      email: user.email || 'citizen@kaydasathi.in',
      phone: user.phone || '+91 98765 43210',
      preferredLanguage: user.preferredLanguage || 'en',
      createdAt: user.createdAt || new Date().toISOString(),
    };

    currentUser = fullUser;
    isLoaded = true;
    await AsyncStorage.setItem(STORAGE_AUTH_USER_KEY, JSON.stringify(fullUser));
    notify();
    return fullUser;
  },

  async loginAsDemo(): Promise<User> {
    return AuthStore.login(DEFAULT_DEMO_USER);
  },

  async logout(): Promise<void> {
    currentUser = null;
    await AsyncStorage.removeItem(STORAGE_AUTH_USER_KEY);
    notify();
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useAuth() {
  const [, setTick] = useState(0);

  useEffect(() => {
    AuthStore.init();
    return AuthStore.subscribe(() => setTick(t => t + 1));
  }, []);

  return {
    user: AuthStore.getUser(),
    isAuthenticated: AuthStore.isAuthenticated(),
    isLoading: !isLoaded,
    login: AuthStore.login,
    loginAsDemo: AuthStore.loginAsDemo,
    logout: AuthStore.logout,
  };
}
