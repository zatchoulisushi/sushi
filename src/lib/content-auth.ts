import { getCollection } from 'astro:content';

// New auth service using Astro Content Layer instead of Supabase runtime
export interface User {
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
  created_at: Date;
  updated_at: Date;
}

export class ContentAuthService {
  static async getUserProfile(userId: string): Promise<User | null> {
    const users = await getCollection('users');
    const user = users.find(u => u.data.id === userId);
    return user ? user.data as User : null;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const users = await getCollection('users');
    const user = users.find(u => u.data.email === email);
    return user ? user.data as User : null;
  }

  static async getAllUsers(): Promise<User[]> {
    const users = await getCollection('users');
    return users.map(u => u.data as User);
  }

  static async getUserLoyaltyTransactions(userId: string) {
    const transactions = await getCollection('loyalty_transactions');
    return transactions
      .filter(t => t.data.user_id === userId)
      .map(t => t.data);
  }

  // Note: Authentication, user creation, profile updates, etc. would need to be 
  // handled by API endpoints or form submissions since Content Layer is read-only at runtime
  // This service is mainly for reading user data at build time or in static contexts
}