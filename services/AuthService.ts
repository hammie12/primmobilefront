async signOut() {
  try {
    await supabase.auth.signOut();
    
    return true;
  } catch (error) {
    console.error('[AuthService.signOut] Error:', error);
    throw error;
  }
} 