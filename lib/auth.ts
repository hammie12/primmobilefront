import { supabase, supabaseAdmin } from './supabase';
import { UserRole } from '../types/user';

export interface SignUpData {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  businessName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthService {
  private logError(method: string, error: any) {
    console.error(`[AuthService.${method}] Error:`, {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      stack: error.stack,
    });
    return error;
  }

  async signUp({
    email,
    password,
    role,
    firstName,
    lastName,
    businessName,
  }: SignUpData) {
    try {
      console.log('[AuthService.signUp] Starting signup process for:', email, 'with role:', role);

      // Sign up with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            first_name: firstName,
            last_name: lastName,
            business_name: businessName
          }
        }
      });

      if (authError) {
        return { error: this.logError('signUp.auth', authError) };
      }

      console.log('[AuthService.signUp] Auth signup successful:', authData.user?.id);
      console.log('[AuthService.signUp] User metadata:', authData.user?.user_metadata);

      if (!authData.user) {
        return { error: this.logError('signUp.auth', new Error('User creation failed')) };
      }

      // Call the stored procedure to create user and profile
      const { error: createError } = await supabase.rpc('create_new_user', {
        user_id: authData.user.id,
        user_email: email,
        user_role: role,
        first_name: firstName,
        last_name: lastName,
        business_name: businessName
      });

      if (createError) {
        return { error: this.logError('signUp.create', createError) };
      }

      console.log('[AuthService.signUp] User and profile created successfully');
      return { data: authData, error: null };
    } catch (error: any) {
      return { error: this.logError('signUp', error) };
    }
  }

  async signIn({ email, password }: SignInData) {
    try {
      console.log('[AuthService.signIn] Starting signin process for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { session: null, user: null, error: this.logError('signIn', error) };
      }

      console.log('[AuthService.signIn] Signin process completed successfully');
      return { session: data.session, user: data.user, error: null };
    } catch (error: any) {
      return { session: null, user: null, error: this.logError('signIn', error) };
    }
  }

  async signOut() {
    try {
      console.log('[AuthService.signOut] Signing out user');
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: this.logError('signOut', error) };
      }
      
      // Clear any persisted session
      await supabase.auth.clearSession();
      
      console.log('[AuthService.signOut] User signed out successfully');
      return { error: null };
    } catch (error: any) {
      return { error: this.logError('signOut', error) };
    }
  }

  async resetPassword(email: string) {
    try {
      console.log('[AuthService.resetPassword] Starting password reset process for:', email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'primemobile://reset-password',
      });

      if (error) {
        return { error: this.logError('resetPassword', error) };
      }

      console.log('[AuthService.resetPassword] Password reset process completed successfully');
      return { error: null };
    } catch (error: any) {
      return { error: this.logError('resetPassword', error) };
    }
  }

  async updatePassword(newPassword: string) {
    try {
      console.log('[AuthService.updatePassword] Starting password update process');

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: this.logError('updatePassword', error) };
      }

      console.log('[AuthService.updatePassword] Password update process completed successfully');
      return { error: null };
    } catch (error: any) {
      return { error: this.logError('updatePassword', error) };
    }
  }

  getUser() {
    return supabase.auth.getUser();
  }

  getSession() {
    return supabase.auth.getSession();
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();
