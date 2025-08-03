import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with environment variables
const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_ANON_KEY
);

// Collection "users"
const users = defineCollection({
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
    updated_at: z.coerce.date(),
  }),
  loader: async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(user => ({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        address: user.address,
        city: user.city,
        postal_code: user.postal_code,
        loyalty_points: user.loyalty_points,
        loyalty_tier: user.loyalty_tier,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }));
    } catch (error) {
      throw new Error('Error fetching users: ' + error.message);
    }
  },
});

// Collection "categories"
const categories = defineCollection({
  schema: z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string(),
    image_url: z.string(),
    sort_order: z.number(),
    is_active: z.boolean(),
    created_at: z.coerce.date(),
  }),
  loader: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      return data.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        image_url: category.image_url,
        sort_order: category.sort_order,
        is_active: category.is_active,
        created_at: category.created_at,
      }));
    } catch (error) {
      throw new Error('Error fetching categories: ' + error.message);
    }
  },
});

// Collection "products"
const products = defineCollection({
  schema: z.object({
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
  }),
  loader: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('sort_order');

      if (error) throw error;

      return data.map(product => ({
        id: product.id,
        category_id: product.category_id,
        name: product.name,
        description: product.description,
        base_price: product.base_price,
        image_url: product.image_url,
        is_popular: product.is_popular,
        is_available: product.is_available,
        allergens: product.allergens,
        nutritional_info: product.nutritional_info,
        preparation_time: product.preparation_time,
        sort_order: product.sort_order,
        created_at: product.created_at,
        updated_at: product.updated_at,
      }));
    } catch (error) {
      throw new Error('Error fetching products: ' + error.message);
    }
  },
});

// Export collections
export const collections = {
  users,
  categories,
  products,
};
