import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DEMO_USERS, type MockUser, type AppRole } from '@/lib/mockData';
import type { User, Session } from '@supabase/supabase-js';

const DEMO_SESSION_KEY = 'mock_session_user_id';

interface ProfileData {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  department: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: { id: string; email: string } | null;
  session: Session | unknown;
  role: AppRole | null;
  profile: ProfileData | null;
  loading: boolean;
  isDemo: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, selectedRole?: AppRole) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  loginAsDemo: (userId: string) => void;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  updateProfile: (data: { full_name?: string; department?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function demoUserToProfile(u: MockUser): ProfileData {
  const now = new Date().toISOString();
  return { id: u.id, user_id: u.id, full_name: u.full_name, email: u.email, department: u.department, status: u.status, created_at: now, updated_at: now };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Demo state
  const [demoUser, setDemoUser] = useState<MockUser | null>(null);

  // Real auth state
  const [realUser, setRealUser] = useState<User | null>(null);
  const [realSession, setRealSession] = useState<Session | null>(null);
  const [realProfile, setRealProfile] = useState<ProfileData | null>(null);
  const [realRole, setRealRole] = useState<AppRole | null>(null);

  const [loading, setLoading] = useState(true);

  const isDemo = !!demoUser;
  const activeUser = demoUser
    ? { id: demoUser.id, email: demoUser.email }
    : realUser
      ? { id: realUser.id, email: realUser.email ?? '' }
      : null;

  // Fetch profile and role for real user
  const fetchProfileAndRole = async (userId: string) => {
    try {
      const [profileRes, roleRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', userId).single(),
        supabase.from('user_roles').select('role').eq('user_id', userId).single(),
      ]);
      if (profileRes.data) setRealProfile(profileRes.data as ProfileData);
      if (roleRes.data) setRealRole(roleRes.data.role as AppRole);
    } catch {
      // ignore
    }
  };

  // Initialize: check demo session first, then real session
  useEffect(() => {
    // Set up real auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setRealSession(session);
      setRealUser(session?.user ?? null);
      if (session?.user) {
        // Defer profile fetch to avoid Supabase deadlock
        setTimeout(() => fetchProfileAndRole(session.user.id), 0);
      } else {
        setRealProfile(null);
        setRealRole(null);
      }
    });

    // Then check for existing demo session
    const savedDemoId = localStorage.getItem(DEMO_SESSION_KEY);
    if (savedDemoId) {
      const found = DEMO_USERS.find(u => u.id === savedDemoId);
      if (found) {
        setDemoUser(found);
        setLoading(false);
        return () => subscription.unsubscribe();
      }
    }

    // Check real session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setRealSession(session);
      setRealUser(session?.user ?? null);
      if (session?.user) {
        fetchProfileAndRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Demo login
  const loginAsDemo = (userId: string) => {
    const found = DEMO_USERS.find(u => u.id === userId);
    if (found) {
      localStorage.setItem(DEMO_SESSION_KEY, found.id);
      setDemoUser(found);
      // Clear any real session state display
    }
  };

  // Real sign in
  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    // Check if it's a demo email first
    const demoMatch = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (demoMatch) {
      loginAsDemo(demoMatch.id);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: new Error(error.message) };
    // Clear demo session if any
    localStorage.removeItem(DEMO_SESSION_KEY);
    setDemoUser(null);
    return { error: null };
  };

  // Real sign up
  const signUp = async (email: string, password: string, fullName: string, selectedRole?: AppRole): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          requested_role: selectedRole || 'employee',
        },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { error: new Error(error.message) };
    return { error: null };
  };

  // Sign out (both demo and real)
  const signOut = async () => {
    if (demoUser) {
      localStorage.removeItem(DEMO_SESSION_KEY);
      setDemoUser(null);
    } else {
      await supabase.auth.signOut();
    }
  };

  // Reset password (send email)
  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { error: new Error(error.message) };
    return { error: null };
  };

  // Update password (after reset)
  const updatePassword = async (password: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: new Error(error.message) };
    return { error: null };
  };

  // Update profile
  const updateProfile = async (data: { full_name?: string; department?: string }) => {
    if (isDemo && demoUser) {
      // Update demo user in memory
      const updated = { ...demoUser, ...data } as MockUser;
      setDemoUser(updated);
      // Persist in localStorage so sidebar reflects changes
      localStorage.setItem(DEMO_SESSION_KEY, updated.id);
      return;
    }
    if (realUser) {
      const { error } = await supabase
        .from('profiles')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('user_id', realUser.id);
      if (error) throw error;
      // Refresh profile
      await fetchProfileAndRole(realUser.id);
    }
  };

  const role: AppRole | null = isDemo ? (demoUser?.role ?? null) : realRole;
  const profile: ProfileData | null = isDemo ? (demoUser ? demoUserToProfile(demoUser) : null) : realProfile;
  const session = isDemo ? demoUser : realSession;

  return (
    <AuthContext.Provider value={{ user: activeUser, session, role, profile, loading, isDemo, signIn, signUp, signOut, loginAsDemo, resetPassword, updatePassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
