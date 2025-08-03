import { defineCollection, z } from 'astro:content';

// Schema for categories
const categorySchema = z.object({
  name: z.string(),
  description: z.string(),
  image_url: z.string(),
  sort_order: z.number(),
  is_active: z.boolean().default(true),
});

// Schema for products
const productSchema = z.object({
  category_id: z.string(),
  name: z.string(),
  description: z.string(),
  base_price: z.number(),
  image_url: z.string(),
  is_popular: z.boolean().default(false),
  is_available: z.boolean().default(true),
  allergens: z.array(z.string()).default([]),
  nutritional_info: z.record(z.any()).optional(),
  preparation_time: z.number().default(15),
  sort_order: z.number().default(0),
});

// Define collections
export const collections = {
  categories: defineCollection({
    type: 'data',
    schema: categorySchema,
  }),
  products: defineCollection({
    type: 'data', 
    schema: productSchema,
  }),
};