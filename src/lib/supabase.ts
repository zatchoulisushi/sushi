import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
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
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string;
          image_url: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          description: string;
          base_price: number;
          image_url: string;
          is_popular: boolean;
          is_available: boolean;
          allergens: string[];
          nutritional_info: any;
          preparation_time: number;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          price_modifier: number;
          is_default: boolean;
          is_available: boolean;
          sort_order: number;
        };
        Insert: Omit<Database['public']['Tables']['product_variants']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['product_variants']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
          order_type: 'dine_in' | 'takeaway' | 'delivery';
          total_amount: number;
          delivery_fee: number;
          loyalty_points_used: number;
          loyalty_points_earned: number;
          special_instructions: string;
          delivery_address: string;
          scheduled_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          special_instructions: string;
        };
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'>;
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
      loyalty_transactions: {
        Row: {
          id: string;
          user_id: string;
          order_id: string | null;
          points_change: number;
          transaction_type: 'earned' | 'redeemed' | 'expired' | 'bonus';
          description: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['loyalty_transactions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['loyalty_transactions']['Insert']>;
      };
      restaurant_settings: {
        Row: {
          id: string;
          key: string;
          value: any;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['restaurant_settings']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['restaurant_settings']['Insert']>;
      };
    };
  };
};