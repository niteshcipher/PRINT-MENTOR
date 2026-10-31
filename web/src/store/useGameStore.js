import { create } from 'zustand';
import { apiRequest, checkApiHealth } from '../api/client';
import confetti from 'canvas-confetti';

export const useGameStore = create((set, get) => ({
  user: null,
  coins: 0,
  coinHistory: [],
  activeTab: 'overview',
  showOnboarding: false,
  mentorMessage: "Welcome to Pixel Mentor! I'm your retro guide to compounding, budgeting, and avoiding scams.",
  mentorQuestions: [],
  isLoading: false,
  apiStatus: 'checking',

  setUser: (user) => set({ user }),
  setTab: (activeTab) => set({ activeTab }),
  setShowOnboarding: (showOnboarding) => set({ showOnboarding }),
  setMentorMessage: (mentorMessage) => set({ mentorMessage }),

  checkHealth: async () => {
    try {
      const data = await checkApiHealth();
      set({ apiStatus: data.status === 'ok' ? 'ok' : 'offline' });
    } catch {
      set({ apiStatus: 'offline' });
    }
  },

  triggerRewardFx: () => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#fbbf24', '#10b981', '#38bdf8']
      });
    } catch (e) {
      // ignore in test or unsupported envs
    }
  },

  fetchProfile: async () => {
    try {
      set({ isLoading: true });
      const data = await apiRequest('/profile');
      set({
        user: data,
        coins: data.coins,
        showOnboarding: !data.onboarding_completed,
        isLoading: false
      });
      // Fetch starter questions
      get().fetchStarterQuestions();
    } catch (e) {
      console.error("Failed to fetch profile", e);
      set({ isLoading: false });
    }
  },

  fetchCoins: async () => {
    try {
      const data = await apiRequest('/coins/balance');
      set({ coins: data.balance, coinHistory: data.history });
    } catch (e) {
      console.error("Failed to fetch coins", e);
    }
  },

  fetchStarterQuestions: async () => {
    try {
      const data = await apiRequest('/coach/starter-questions');
      if (data && data.questions) {
        set({ mentorQuestions: data.questions });
      }
    } catch (e) {
      console.error("Failed to fetch starter questions", e);
    }
  },

  updateCoinsLocally: (delta) => {
    set((state) => ({ coins: state.coins + delta }));
    if (delta > 0) {
      get().triggerRewardFx();
    }
  }
}));

