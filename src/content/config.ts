import { defineCollection, z } from 'astro:content';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for build-time data loading with service role key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const shouldLoadData = supabaseUrl && supabaseServiceKey;

let supabase: any = null;
if (shouldLoadData) {
  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Zod schemas matching the database structure
const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  phone: z.string(),
  address: z.string(),
  city: z.string(),
  postal_code: z.string(),
  loyalty_points: z.number(),
  loyalty_tier: z.enum(['bronze', 'silver', 'gold', 'platinum']),
  created_at: z.string(),
  updated_at: z.string(),
});

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  image_url: z.string(),
  sort_order: z.number(),
  is_active: z.boolean(),
  created_at: z.string(),
});

const productSchema = z.object({
  id: z.string(),
  category_id: z.string(),
  name: z.string(),
  description: z.string(),
  base_price: z.number(),
  image_url: z.string(),
  is_popular: z.boolean(),
  is_available: z.boolean(),
  allergens: z.array(z.string()),
  nutritional_info: z.any(),
  preparation_time: z.number(),
  sort_order: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

const productVariantSchema = z.object({
  id: z.string(),
  product_id: z.string(),
  name: z.string(),
  price_modifier: z.number(),
  is_default: z.boolean(),
  is_available: z.boolean(),
  sort_order: z.number(),
});

const orderSchema = z.object({
  id: z.string(),
  user_id: z.string().nullable(),
  order_number: z.string(),
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']),
  order_type: z.enum(['dine_in', 'takeaway', 'delivery']),
  total_amount: z.number(),
  delivery_fee: z.number(),
  loyalty_points_used: z.number(),
  loyalty_points_earned: z.number(),
  special_instructions: z.string(),
  delivery_address: z.string(),
  scheduled_time: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

const orderItemSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  product_id: z.string(),
  variant_id: z.string().nullable(),
  quantity: z.number(),
  unit_price: z.number(),
  total_price: z.number(),
  special_instructions: z.string(),
});

const loyaltyTransactionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  order_id: z.string().nullable(),
  points_change: z.number(),
  transaction_type: z.enum(['earned', 'redeemed', 'expired', 'bonus']),
  description: z.string(),
  created_at: z.string(),
});

const restaurantSettingSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.any(),
  updated_at: z.string(),
});

// Data loaders for each collection
const usersCollection = defineCollection({
  loader: async () => {
    if (!shouldLoadData || !supabase) {
      console.warn('Supabase not configured, returning empty users data');
      return [];
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading users:', error);
      return [];
    }

    return data.map((user) => ({
      id: user.id,
      ...user,
    }));
  },
  schema: userSchema,
});

const categoriesCollection = defineCollection({
  loader: async () => {
    if (!shouldLoadData || !supabase) {
      console.warn('Supabase not configured, returning empty categories data');
      return [];
    }

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Error loading categories:', error);
      return [];
    }

    return data.map((category) => ({
      id: category.id,
      ...category,
    }));
  },
  schema: categorySchema,
});

const productsCollection = defineCollection({
  loader: async () => {
    if (!shouldLoadData || !supabase) {
      console.warn('Supabase not configured, returning empty products data');
      return [];
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .order('sort_order');

    if (error) {
      console.error('Error loading products:', error);
      return [];
    }

    return data.map((product) => ({
      id: product.id,
      ...product,
      base_price: parseFloat(product.base_price),
    }));
  },
  schema: productSchema,
});

const productVariantsCollection = defineCollection({
  loader: async () => {
    if (!shouldLoadData || !supabase) {
      console.warn('Supabase not configured, returning empty product variants data');
      return [];
    }

    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('is_available', true)
      .order('sort_order');

    if (error) {
      console.error('Error loading product variants:', error);
      return [];
    }

    return data.map((variant) => ({
      id: variant.id,
      ...variant,
      price_modifier: parseFloat(variant.price_modifier),
    }));
  },
  schema: productVariantSchema,
});

const ordersCollection = defineCollection({
  loader: async () => {
    if (!shouldLoadData || !supabase) {
      console.warn('Supabase not configured, returning empty orders data');
      return [];
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading orders:', error);
      return [];
    }

    return data.map((order) => ({
      id: order.id,
      ...order,
      total_amount: parseFloat(order.total_amount),
      delivery_fee: parseFloat(order.delivery_fee),
    }));
  },
  schema: orderSchema,
});

const orderItemsCollection = defineCollection({
  loader: async () => {
    if (!shouldLoadData || !supabase) {
      console.warn('Supabase not configured, returning empty order items data');
      return [];
    }

    const { data, error } = await supabase
      .from('order_items')
      .select('*');

    if (error) {
      console.error('Error loading order items:', error);
      return [];
    }

    return data.map((item) => ({
      id: item.id,
      ...item,
      unit_price: parseFloat(item.unit_price),
      total_price: parseFloat(item.total_price),
    }));
  },
  schema: orderItemSchema,
});

const loyaltyTransactionsCollection = defineCollection({
  loader: async () => {
    if (!shouldLoadData || !supabase) {
      console.warn('Supabase not configured, returning empty loyalty transactions data');
      return [];
    }

    const { data, error } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading loyalty transactions:', error);
      return [];
    }

    return data.map((transaction) => ({
      id: transaction.id,
      ...transaction,
    }));
  },
  schema: loyaltyTransactionSchema,
});

const restaurantSettingsCollection = defineCollection({
  loader: async () => {
    if (!shouldLoadData || !supabase) {
      console.warn('Supabase not configured, returning empty restaurant settings data');
      return [];
    }

    const { data, error } = await supabase
      .from('restaurant_settings')
      .select('*');

    if (error) {
      console.error('Error loading restaurant settings:', error);
      return [];
    }

    return data.map((setting) => ({
      id: setting.id,
      ...setting,
    }));
  },
  schema: restaurantSettingSchema,
});

// Export collections
export const collections = {
  users: usersCollection,
  categories: categoriesCollection,
  products: productsCollection,
  'product-variants': productVariantsCollection,
  orders: ordersCollection,
  'order-items': orderItemsCollection,
  'loyalty-transactions': loyaltyTransactionsCollection,
  'restaurant-settings': restaurantSettingsCollection,
};