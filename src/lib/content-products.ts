import { getCollection, getEntry } from 'astro:content';

// New products service using Astro Content Layer instead of Supabase runtime
export interface ProductWithVariants {
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
  created_at: Date;
  updated_at: Date;
  variants: Array<{
    id: string;
    product_id: string;
    name: string;
    price_modifier: number;
    is_default: boolean;
    is_available: boolean;
    sort_order: number;
  }>;
  category: {
    id: string;
    name: string;
    description: string;
    image_url: string;
    sort_order: number;
    is_active: boolean;
    created_at: Date;
  };
}

export class ContentProductService {
  static async getCategories() {
    const categories = await getCollection('categories');
    return categories.map(c => c.data);
  }

  static async getProducts(categoryId?: string) {
    const products = await getCollection('products');
    const variants = await getCollection('product_variants');
    const categories = await getCollection('categories');
    
    // Filter by category if specified
    const filteredProducts = categoryId 
      ? products.filter(p => p.data.category_id === categoryId)
      : products;
    
    // Combine with variants and categories
    return filteredProducts.map(product => {
      const productVariants = variants.filter(v => v.data.product_id === product.data.id);
      const category = categories.find(c => c.data.id === product.data.category_id);
      
      return {
        ...product.data,
        variants: productVariants.map(v => v.data),
        category: category?.data || null
      } as ProductWithVariants;
    });
  }

  static async getProduct(id: string) {
    const products = await getCollection('products');
    const variants = await getCollection('product_variants');
    const categories = await getCollection('categories');
    
    const product = products.find(p => p.data.id === id);
    if (!product) return null;
    
    const productVariants = variants.filter(v => v.data.product_id === id);
    const category = categories.find(c => c.data.id === product.data.category_id);
    
    return {
      ...product.data,
      variants: productVariants.map(v => v.data),
      category: category?.data || null
    } as ProductWithVariants;
  }

  static async searchProducts(query: string) {
    const products = await this.getProducts();
    
    return products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  static calculatePrice(product: { base_price: number }, variantId?: string, variants?: Array<{ id: string; price_modifier: number }>) {
    let price = product.base_price;
    
    if (variantId && variants) {
      const variant = variants.find(v => v.id === variantId);
      if (variant) {
        price += variant.price_modifier;
      }
    }
    
    return price;
  }
}