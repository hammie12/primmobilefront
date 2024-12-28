import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { authService } from '../lib/auth';
import { UserRole } from '../types/user';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (data: {
    email: string;
    password: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    businessName?: string;
  }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Initialize the auth state
    const initAuth = async () => {
      try {
        console.log('[AuthContext] Initializing auth state');
        const { data: { session } } = await authService.getSession();
        
        if (!isMounted) return;

        console.log('[AuthContext] Initial session:', session?.user?.user_metadata);
        
        // Check if the session is valid
        if (session?.expires_at) {
          const expiresAt = new Date(session.expires_at * 1000);
          if (expiresAt < new Date()) {
            console.log('[AuthContext] Session expired, signing out');
            await authService.signOut();
            setSession(null);
            setUser(null);
            setUserRole(null);
            setIsLoading(false);
            return;
          }
        }

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const metadataRole = session.user.user_metadata?.role;
          console.log('[AuthContext] Setting role from metadata:', metadataRole);
          setUserRole(metadataRole ?? null);
        }
      } catch (error) {
        console.error('[AuthContext] Error initializing auth:', error);
        // Clear session on error
        setSession(null);
        setUser(null);
        setUserRole(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('[AuthContext] Auth state changed:', event);
        console.log('[AuthContext] New session metadata:', session?.user?.user_metadata);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const metadataRole = session.user.user_metadata?.role;
          console.log('[AuthContext] Setting role from metadata:', metadataRole);
          setUserRole(metadataRole ?? null);
        } else {
          setUserRole(null);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await authService.signIn({ email, password });
    return { error };
  };

  const signUp = async (data: {
    email: string;
    password: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    businessName?: string;
  }) => {
    const { error } = await authService.signUp(data);
    return { error };
  };

  const signOut = async () => {
    await authService.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await authService.resetPassword(email);
    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        userRole,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
