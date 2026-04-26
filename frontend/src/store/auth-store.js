import { create } from "zustand";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";

export const useAuthStore = create((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,

  bootstrap: async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      set({ session, user: session?.user ?? null });

      if (session?.user) {
        await get().refreshProfile();
      }

      supabase.auth.onAuthStateChange(async (_event, nextSession) => {
        set({
          session: nextSession,
          user: nextSession?.user ?? null,
        });

        if (nextSession?.user) {
          await get().refreshProfile();
        } else {
          set({ profile: null, loading: false });
        }
      });
    } catch (error) {
      toast.error(error.message);
    } finally {
      set({ loading: false });
    }
  },

  refreshProfile: async () => {
    try {
      const response = await api.get("/auth/me");
      set({ profile: response.data.profile, loading: false });
    } catch (error) {
      set({ profile: null, loading: false });
      throw error;
    }
  },

  login: async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    toast.success("Login berhasil.");
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ session: null, user: null, profile: null });
    toast.success("Anda telah keluar.");
  },
}));

