import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthUser extends User {
  user_metadata: {
    first_name?: string;
    last_name?: string;
    phone?: string;
  };
}

export class AuthService {
  static async signUp(email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    phone: string;
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
        }
      }
    });

    if (error) throw error;

    // Create user profile
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        address: '',
        city: '',
        postal_code: '',
        loyalty_points: 0,
        loyalty_tier: 'bronze'
      });
    }

    return data;
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  static async updateProfile(updates: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  }) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('users')
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        phone: updates.phone,
        address: updates.address,
        city: updates.city,
        postal_code: updates.postalCode,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) throw error;
  }

  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }
}