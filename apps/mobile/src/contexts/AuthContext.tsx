import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "../services/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  total_xp: number;
  level: number;
  games_played: number;
  best_chain: number;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAnonymous: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthContextType extends AuthState {
  signInAnonymously: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, username: string) => Promise<void>;
  upgradeAnonymousAccount: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isAnonymous: false,
    isLoading: true,
    isInitialized: false,
  });

  // Fetch user profile from users table
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        // Profile might not exist yet for anonymous users
        if (error.code === "PGRST116") {
          return null;
        }
        console.error("Error fetching profile:", error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }, []);

  // Create profile for new user
  const createProfile = useCallback(async (userId: string, username: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .insert({
          id: userId,
          username,
          total_xp: 0,
          level: 1,
          games_played: 0,
          best_chain: 0,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating profile:", error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error("Error creating profile:", error);
      return null;
    }
  }, []);

  // Update profile username
  const updateProfileUsername = useCallback(async (userId: string, username: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .update({ username })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating profile:", error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const isAnon = session.user.is_anonymous ?? false;
          const profile = await fetchProfile(session.user.id);

          setState({
            user: session.user,
            session,
            profile,
            isAnonymous: isAnon,
            isLoading: false,
            isInitialized: true,
          });
        } else {
          // No session - create anonymous session
          await signInAnonymouslyInternal();
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          isInitialized: true,
        }));
      }
    };

    initAuth();

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const isAnon = session.user.is_anonymous ?? false;
          const profile = await fetchProfile(session.user.id);

          setState({
            user: session.user,
            session,
            profile,
            isAnonymous: isAnon,
            isLoading: false,
            isInitialized: true,
          });
        } else if (event === "SIGNED_OUT") {
          setState({
            user: null,
            session: null,
            profile: null,
            isAnonymous: false,
            isLoading: false,
            isInitialized: true,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Internal anonymous sign in (used during init)
  const signInAnonymouslyInternal = async () => {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) throw error;

      if (data.user) {
        setState({
          user: data.user,
          session: data.session,
          profile: null,
          isAnonymous: true,
          isLoading: false,
          isInitialized: true,
        });
      }
    } catch (error) {
      console.error("Error signing in anonymously:", error);
      // Continue without auth - app works in "guest mode"
      // Anonymous auth might not be enabled in Supabase
      setState({
        user: null,
        session: null,
        profile: null,
        isAnonymous: true, // Treat as anonymous even without session
        isLoading: false,
        isInitialized: true,
      });
    }
  };

  // Public sign in anonymously
  const signInAnonymously = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await signInAnonymouslyInternal();
  }, []);

  // Sign in with email
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const profile = await fetchProfile(data.user.id);
        setState({
          user: data.user,
          session: data.session,
          profile,
          isAnonymous: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [fetchProfile]);

  // Sign up with email
  const signUpWithEmail = useCallback(async (email: string, password: string, username: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        const profile = await createProfile(data.user.id, username);

        setState({
          user: data.user,
          session: data.session,
          profile,
          isAnonymous: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [createProfile]);

  // Upgrade anonymous account to email
  const upgradeAnonymousAccount = useCallback(async (email: string, password: string, username: string) => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Update anonymous user with email/password
      const { data, error } = await supabase.auth.updateUser({
        email,
        password,
        data: { username },
      });

      if (error) throw error;

      if (data.user) {
        // Create or update profile
        let profile = await fetchProfile(data.user.id);
        if (!profile) {
          // Profile doesn't exist - create it
          profile = await createProfile(data.user.id, username);
        } else {
          // Profile exists - update the username
          profile = await updateProfileUsername(data.user.id, username);
        }

        setState({
          user: data.user,
          session: state.session,
          profile,
          isAnonymous: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [fetchProfile, createProfile, updateProfileUsername, state.session]);

  // Sign out
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // After sign out, create new anonymous session
      await signInAnonymouslyInternal();
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (!state.user) return;

    const profile = await fetchProfile(state.user.id);
    setState(prev => ({ ...prev, profile }));
  }, [state.user, fetchProfile]);

  const value: AuthContextType = {
    ...state,
    signInAnonymously,
    signInWithEmail,
    signUpWithEmail,
    upgradeAnonymousAccount,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
