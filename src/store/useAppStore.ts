import { create } from 'zustand';
import type { User, UserRole, ChatMessage, MerchantProfile, CuratorProfile } from '@/types';

interface AppState {
  // User State
  user: User | MerchantProfile | CuratorProfile | null;
  isAuthenticated: boolean;
  activeRole: UserRole | null;
  
  // Chat State
  isChatOpen: boolean;
  chatMessages: ChatMessage[];
  
  // UI State
  isDarkMode: boolean;
  
  // Actions
  setUser: (user: User | MerchantProfile | CuratorProfile | null) => void;
  updateUserProfile: (updates: { profile_pic?: string; cover_url?: string; partner_profile_pic?: string; partner_cover_url?: string }) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
  toggleChat: () => void;
  setChatOpen: (open: boolean) => void;
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  setDarkMode: (dark: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => {
  const normalizeRole = (r: any): UserRole | null => {
    if (!r) return null;
    // Backend may send legacy/alt role labels
    if (r === "influencer" || r === "adventurer") return "curator";
    return r as UserRole;
  };

  const normalizeRoles = (u: any): UserRole[] | undefined => {
    const raw = u?.roles;
    if (!Array.isArray(raw)) return undefined;
    const mapped = raw
      .map(normalizeRole)
      .filter((r: UserRole | null): r is UserRole => !!r);
    return Array.from(new Set(mapped));
  };

  return {
    // Initial State
    user: null,
    isAuthenticated: false,
    activeRole: null,
    isChatOpen: false,
    chatMessages: [],
    isDarkMode: false,

    // Actions
    setUser: (user) => {
      if (!user) {
        set({ user: null, isAuthenticated: false, activeRole: null, isDarkMode: false });
        return;
      }

      const normalizedActiveRole = normalizeRole((user as any)?.activeRole ?? (user as any)?.role);
      const normalizedRoles = normalizeRoles(user) ?? (normalizedActiveRole ? [normalizedActiveRole] : []);

      const normalizedUser = {
        ...(user as any),
        role: normalizedActiveRole ?? (user as any)?.role,
        activeRole: normalizedActiveRole ?? (user as any)?.activeRole ?? (user as any)?.role,
        roles: normalizedRoles,
      };

      set({
        user: normalizedUser,
        isAuthenticated: true,
        activeRole: normalizedUser.activeRole,
        isDarkMode: normalizedUser.activeRole === "curator",
      });
    },

    updateUserProfile: (updates) => {
      const { user } = get();
      if (!user) return;
      set({ user: { ...(user as any), ...updates } });
    },

    switchRole: (role) => {
      const { user } = get();
      if (!user) return;

      const roles = (user as any)?.roles as UserRole[] | undefined;
      if (roles && !roles.includes(role)) return;

      set({
        user: { ...(user as any), activeRole: role, role },
        activeRole: role,
        isDarkMode: role === "curator",
      });
    },

    logout: () =>
      set({
        user: null,
        isAuthenticated: false,
        activeRole: null,
        isDarkMode: false,
      }),

    toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

    setChatOpen: (open) => set({ isChatOpen: open }),

    addChatMessage: (message) =>
      set((state) => ({
        chatMessages: [...state.chatMessages, message],
      })),

    clearChat: () => set({ chatMessages: [] }),

    setDarkMode: (dark) => set({ isDarkMode: dark }),
  };
});

