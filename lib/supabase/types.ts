export type UserRole = 'CUSTOMER' | 'PROFESSIONAL' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

import { Database } from './schema'

// Define custom types for your Supabase tables
export type Tables = Database['public']['Tables']

// Utility type to get Row type from any table
export type TableRow<T extends keyof Tables> = Tables[T]['Row']

// Utility type to get Insert type from any table
export type TableInsert<T extends keyof Tables> = Tables[T]['Insert']

// Utility type to get Update type from any table
export type TableUpdate<T extends keyof Tables> = Tables[T]['Update']

// Export commonly used table types
export type Profile = TableRow<'profiles'>
export type Message = TableRow<'messages'>

// Export commonly used insert types
export type ProfileInsert = TableInsert<'profiles'>
export type MessageInsert = TableInsert<'messages'>

// Export commonly used update types
export type ProfileUpdate = TableUpdate<'profiles'>
export type MessageUpdate = TableUpdate<'messages'> 