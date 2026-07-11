import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// Falls back to an in-memory store if localStorage is unavailable or broken
// (e.g. private browsing mode, or the jsdom/Node test environment).
function resolveStorage() {
  try {
    window.localStorage.setItem('__familytree_storage_check__', '1')
    window.localStorage.removeItem('__familytree_storage_check__')
    return window.localStorage
  } catch {
    const memory = new Map()
    return {
      getItem: (key) => (memory.has(key) ? memory.get(key) : null),
      setItem: (key, value) => memory.set(key, value),
      removeItem: (key) => memory.delete(key),
    }
  }
}

export const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      username: null,

      loginSuccess: (data, usernameFallback) => {
        set({
          accessToken: data.access,
          refreshToken: data.refresh,
          userId: data.user_id ?? null,
          username: data.username ?? usernameFallback ?? null,
        })
      },

      logout: () => {
        set({ accessToken: null, refreshToken: null, userId: null, username: null })
      },
    }),
    { name: 'familytree-auth', storage: createJSONStorage(resolveStorage) },
  ),
)

export function isAuthenticated() {
  return Boolean(useAuthStore.getState().accessToken)
}
