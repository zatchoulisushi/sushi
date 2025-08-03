import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with environment variables
const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables SUPABASE_URL and SUPABASE_ANON_KEY are required.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Collection "product_variants"
const productVariants = defineCollection({
  schema: z.object({
    id: z.string().uuid(),
    product_id: z.string().uuid(),
    name: z.string(),
    price_modifier: z.number(),
    is_default: z.boolean(),
    is_available: z.boolean(),
    sort_order: z.number(),
  }),
  loader: async () => {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('is_available', true)
        .order('sort_order');

      if (error) throw error;

      return data.map(variant => ({
        id: variant.id,
        product_id: variant.product_id,
        name: variant.name,
        price_modifier: variant.price_modifier,
        is_default: variant.is_default,
        is_available: variant.is_available,
        sort_order: variant.sort_order,
      }));
    } catch (error) {
      throw new Error('Error fetching product variants: ' + error.message);
    }
  },
});

// Collection "orders"
const orders = defineCollection({
  schema: z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid().nullable(),
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
  }),
  loader: async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(order => ({
        id: order.id,
        user_id: order.user_id,
        order_number: order.order_number,
        status: order.status,
        order_type: order.order_type,
        total_amount: order.total_amount,
        delivery_fee: order.delivery_fee,
        loyalty_points_used: order.loyalty_points_used,
        loyalty_points_earned: order.loyalty_points_earned,
        special_instructions: order.special_instructions,
        delivery_address: order.delivery_address,
        scheduled_time: order.scheduled_time,
        created_at: order.created_at,
        updated_at: order.updated_at,
      }));
    } catch (error) {
      throw new Error('Error fetching orders: ' + error.message);
    }
  },
});

// Collection "order_items"
const orderItems = defineCollection({
  schema: z.object({
    id: z.string().uuid(),
    order_id: z.string().uuid(),
    product_id: z.string().uuid(),
    variant_id: z.string().uuid().nullable(),
    quantity: z.number(),
    unit_price: z.number(),
    total_price: z.number(),
    special_instructions: z.string(),
  }),
  loader: async () => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*');

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        order_id: item.order_id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
        special_instructions: item.special_instructions,
      }));
    } catch (error) {
      throw new Error('Error fetching order items: ' + error.message);
    }
  },
});

// Collection "loyalty_transactions"
const loyaltyTransactions = defineCollection({
  schema: z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    order_id: z.string().uuid().nullable(),
    points_change: z.number(),
    transaction_type: z.enum(['earned', 'redeemed', 'expired', 'bonus']),
    description: z.string(),
    created_at: z.coerce.date(),
  }),
  loader: async () => {
    try {
      const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*');

      if (error) throw error;

      return data.map(transaction => ({
        id: transaction.id,
        user_id: transaction.user_id,
        order_id: transaction.order_id,
        points_change: transaction.points_change,
        transaction_type: transaction.transaction_type,
        description: transaction.description,
        created_at: transaction.created_at,
      }));
    } catch (error) {
      throw new Error('Error fetching loyalty transactions: ' + error.message);
    }
  },
});

// Collection "restaurant_settings"
const restaurantSettings = defineCollection({
  schema: z.object({
    id: z.string().uuid(),
    key: z.string(),
    value: z.any(),
    updated_at: z.coerce.date(),
  }),
  loader: async () => {
    try {
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*');

      if (error) throw error;

      return data.map(setting => ({
        id: setting.id,
        key: setting.key,
        value: setting.value,
        updated_at: setting.updated_at,
      }));
    } catch (error) {
      throw new Error('Error fetching restaurant settings: ' + error.message);
    }
  },
});

// Export collections
export const collections = {
  users,
  categories,
  products,
  productVariants,
  orders,
  orderItems,
  loyaltyTransactions,
  restaurantSettings,
};
