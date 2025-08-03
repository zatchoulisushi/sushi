import { supabase } from './supabase';
import type { Database } from './supabase';

type Product = Database['public']['Tables']['products']['Row'];
type ProductVariant = Database['public']['Tables']['product_variants']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
  category: Category;
}

export class ProductService {
  static async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) throw error;
    return data;
  }

  static async getProducts(categoryId?: string) {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        variants:product_variants(*)
      `)
      .eq('is_available', true)
      .order('sort_order');

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as ProductWithVariants[];
  }

  static async getProduct(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        variants:product_variants(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ProductWithVariants;
  }

  static async searchProducts(query: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        variants:product_variants(*)
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_available', true)
      .order('sort_order');

    if (error) throw error;
    return data as ProductWithVariants[];
  }

  static calculatePrice(product: Product, variantId?: string) {
    let price = product.base_price;
    
    if (variantId) {
      // This would need to be handled with the variants data
      // For now, return base price
    }
    
    return price;
  }
}