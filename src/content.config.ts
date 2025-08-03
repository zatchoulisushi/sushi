import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for build-time only using service role key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found. Using placeholder values for development.');
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key'
);

// Helper function to safely execute Supabase queries
async function safeSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T[] | null; error: any }>,
  fallbackData: T[] = []
): Promise<T[]> {
  if (!supabaseUrl || !supabaseServiceKey || supabaseUrl.includes('placeholder')) {
    console.warn('Supabase not properly configured, returning empty data');
    return fallbackData;
  }
  
  try {
    const { data, error } = await queryFn();
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.warn(`Supabase query failed: ${error}. Returning empty data.`);
    return fallbackData;
  }
}
const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  postal_code: z.string(),
  loyalty_points: z.number(),
  loyalty_tier: z.enum(['bronze', 'silver', 'gold', 'platinum']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  image_url: z.string(),
  sort_order: z.number(),
  is_active: z.boolean(),
  created_at: z.coerce.date(),
});

const productSchema = z.object({
  id: z.string().uuid(),
  category_id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  base_price: z.number(),
  image_url: z.string(),
  is_popular: z.boolean(),
  is_available: z.boolean(),
  allergens: z.array(z.string()),
  nutritional_info: z.any().nullable(),
  preparation_time: z.number(),
  sort_order: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

const productVariantSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  name: z.string(),
  price_modifier: z.number(),
  is_default: z.boolean(),
  is_available: z.boolean(),
  sort_order: z.number(),
});

const orderSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string(),
  order_number: z.string(),
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']),
  order_type: z.enum(['dine_in', 'takeaway', 'delivery']),
  total_amount: z.number(),
  delivery_fee: z.number(),
  loyalty_points_used: z.number(),
  loyalty_points_earned: z.number(),
  special_instructions: z.string(),
  delivery_address: z.string(),
  scheduled_time: z.coerce.date(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

const orderItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  product_id: z.string().uuid(),
  variant_id: z.string().uuid().nullable(),
  quantity: z.number(),
  unit_price: z.number(),
  total_price: z.number(),
  special_instructions: z.string(),
});

const loyaltyTransactionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  order_id: z.string().uuid().nullable(),
  points_change: z.number(),
  transaction_type: z.enum(['earned', 'redeemed', 'expired', 'bonus']),
  description: z.string(),
  created_at: z.coerce.date(),
});

const restaurantSettingSchema = z.object({
  id: z.string().uuid(),
  key: z.string(),
  value: z.any(),
  updated_at: z.coerce.date(),
});

// Define collections with loaders
export const collections = {
  users: defineCollection({
    schema: userSchema,
    loader: async () => {
      return safeSupabaseQuery(() =>
        supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
      );
    },
  }),

  categories: defineCollection({
    schema: categorySchema,
    loader: async () => {
      return safeSupabaseQuery(() =>
        supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order')
      );
    },
  }),

  products: defineCollection({
    schema: productSchema,
    loader: async () => {
      return safeSupabaseQuery(() =>
        supabase
          .from('products')
          .select('*')
          .eq('is_available', true)
          .order('sort_order')
      );
    },
  }),

  product_variants: defineCollection({
    schema: productVariantSchema,
    loader: async () => {
      return safeSupabaseQuery(() =>
        supabase
          .from('product_variants')
          .select('*')
          .eq('is_available', true)
          .order('sort_order')
      );
    },
  }),

  orders: defineCollection({
    schema: orderSchema,
    loader: async () => {
      return safeSupabaseQuery(() =>
        supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
      );
    },
  }),

  order_items: defineCollection({
    schema: orderItemSchema,
    loader: async () => {
      return safeSupabaseQuery(() =>
        supabase
          .from('order_items')
          .select('*')
      );
    },
  }),

  loyalty_transactions: defineCollection({
    schema: loyaltyTransactionSchema,
    loader: async () => {
      return safeSupabaseQuery(() =>
        supabase
          .from('loyalty_transactions')
          .select('*')
          .order('created_at', { ascending: false })
      );
    },
  }),

  restaurant_settings: defineCollection({
    schema: restaurantSettingSchema,
    loader: async () => {
      return safeSupabaseQuery(() =>
        supabase
          .from('restaurant_settings')
          .select('*')
      );
    },
  }),
};