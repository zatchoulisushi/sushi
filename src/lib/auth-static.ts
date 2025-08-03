// Stub authentication service to replace Supabase auth
// This provides the same interface but with placeholder functionality

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  loyalty_points: number;
  loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  created_at: string;
  updated_at: string;
}

export class AuthService {
  static async signUp(email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    phone: string;
  }) {
    console.warn('AuthService.signUp - Static site mode: Authentication not available');
    throw new Error('Authentication not available in static site mode');
  }

  static async signIn(email: string, password: string) {
    console.warn('AuthService.signIn - Static site mode: Authentication not available');
    throw new Error('Authentication not available in static site mode');
  }

  static async signOut() {
    console.warn('AuthService.signOut - Static site mode: Authentication not available');
    // No-op in static mode
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    console.warn('AuthService.getCurrentUser - Static site mode: No authenticated user');
    return null;
  }

  static async updateProfile(updates: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  }) {
    console.warn('AuthService.updateProfile - Static site mode: Profile updates not available');
    throw new Error('Profile updates not available in static site mode');
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    console.warn('AuthService.getUserProfile - Static site mode: User profiles not available');
    return null;
  }
}