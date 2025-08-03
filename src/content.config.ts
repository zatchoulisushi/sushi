import { defineCollection, z } from 'astro:content';
import { supabase } from './lib/supabase-server';

// Zod schemas aligned with Supabase database schema
export const collections = {
  users: defineCollection({
    schema: z.object({
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
      updated_at: z.coerce.date()
    }),
    loader: async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) throw new Error(`Failed to load users: ${error.message}`);
      return (data || []).map(user => ({
        id: user.id,
        ...user
      }));
    }
  }),

  categories: defineCollection({
    schema: z.object({
      id: z.string().uuid(),
      name: z.string(),
      description: z.string(),
      image_url: z.string().url(),
      sort_order: z.number(),
      is_active: z.boolean(),
      created_at: z.coerce.date()
    }),
    loader: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw new Error(`Failed to load categories: ${error.message}`);
      return (data || []).map(category => ({
        id: category.id,
        ...category
      }));
    }
  }),

  products: defineCollection({
    schema: z.object({
      id: z.string().uuid(),
      category_id: z.string().uuid(),
      name: z.string(),
      description: z.string(),
      base_price: z.number(),
      image_url: z.string().url(),
      is_popular: z.boolean(),
      is_available: z.boolean(),
      allergens: z.array(z.string()),
      nutritional_info: z.any().optional(),
      preparation_time: z.number(),
      sort_order: z.number(),
      created_at: z.coerce.date(),
      updated_at: z.coerce.date()
    }),
    loader: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('sort_order');
      
      if (error) throw new Error(`Failed to load products: ${error.message}`);
      return (data || []).map(product => ({
        id: product.id,
        ...product
      }));
    }
  }),

  product_variants: defineCollection({
    schema: z.object({
      id: z.string().uuid(),
      product_id: z.string().uuid(),
      name: z.string(),
      price_modifier: z.number(),
      is_default: z.boolean(),
      is_available: z.boolean(),
      sort_order: z.number()
    }),
    loader: async () => {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('is_available', true)
        .order('sort_order');
      
      if (error) throw new Error(`Failed to load product_variants: ${error.message}`);
      return (data || []).map(variant => ({
        id: variant.id,
        ...variant
      }));
    }
  }),

  orders: defineCollection({
    schema: z.object({
      id: z.string().uuid(),
      user_id: z.string().uuid(),
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
      updated_at: z.coerce.date()
    }),
    loader: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(`Failed to load orders: ${error.message}`);
      return (data || []).map(order => ({
        id: order.id,
        ...order
      }));
    }
  }),

  order_items: defineCollection({
    schema: z.object({
      id: z.string().uuid(),
      order_id: z.string().uuid(),
      product_id: z.string().uuid(),
      variant_id: z.string().uuid().nullable(),
      quantity: z.number(),
      unit_price: z.number(),
      total_price: z.number(),
      special_instructions: z.string()
    }),
    loader: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select('*');
      
      if (error) throw new Error(`Failed to load order_items: ${error.message}`);
      return (data || []).map(item => ({
        id: item.id,
        ...item
      }));
    }
  }),

  loyalty_transactions: defineCollection({
    schema: z.object({
      id: z.string().uuid(),
      user_id: z.string().uuid(),
      order_id: z.string().uuid().nullable(),
      points_change: z.number(),
      transaction_type: z.enum(['earned', 'redeemed', 'expired', 'bonus']),
      description: z.string(),
      created_at: z.coerce.date()
    }),
    loader: async () => {
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(`Failed to load loyalty_transactions: ${error.message}`);
      return (data || []).map(transaction => ({
        id: transaction.id,
        ...transaction
      }));
    }
  }),

  restaurant_settings: defineCollection({
    schema: z.object({
      id: z.string().uuid(),
      key: z.string(),
      value: z.any(),
      updated_at: z.coerce.date()
    }),
    loader: async () => {
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*');
      
      if (error) throw new Error(`Failed to load restaurant_settings: ${error.message}`);
      return (data || []).map(setting => ({
        id: setting.id,
        ...setting
      }));
    }
  })
};