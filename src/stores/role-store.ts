import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RoleStore {
  isRoleMismatch: boolean;
  setRoleMismatch: (value: boolean) => void;
  reset: () => void;
}

export const useRoleStore = create<RoleStore>()(
  persist(
    (set) => ({
      isRoleMismatch: false,
      setRoleMismatch: (value) => set({ isRoleMismatch: value }),
      reset: () => set({ isRoleMismatch: false }),
    }),
    {
      name: "role-store",
    },
  ),
);
