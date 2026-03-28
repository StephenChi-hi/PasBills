"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/util/supabase/client";
import { seedDefaultCategoriesForUser } from "@/util/seedCategories";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Seed categories when session is restored (existing user)
      if (_event === "SIGNED_IN" && session?.user?.id) {
        seedDefaultCategoriesForUser(session.user.id).catch((err) =>
          console.error("Failed to seed categories on session restore:", err),
        );
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auth functions
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    // Seed default categories for new user
    if (data.user?.id) {
      try {
        await seedDefaultCategoriesForUser(data.user.id);
      } catch (seedError) {
        console.error("Failed to seed categories:", seedError);
        // Don't throw - signup was successful, just categories failed
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    // Seed categories for existing user (adds any new ones)
    if (data.user?.id) {
      try {
        await seedDefaultCategoriesForUser(data.user.id);
      } catch (seedError) {
        console.error("Failed to seed new categories:", seedError);
        // Don't throw - signin was successful
      }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/reset-password`,
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signOut, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
