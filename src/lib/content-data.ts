import { getCollection, getEntry } from 'astro:content';

// Types based on our schema
export interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
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
}

export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  price_modifier: number;
  is_default: boolean;
  is_available: boolean;
  sort_order: number;
}

export interface ProductWithVariants extends Product {
  variants: ProductVariant[];
  category?: Category;
}

// Helper functions to access content layer data with fallbacks
export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await getCollection('categories');
    return categories.map(cat => cat.data);
  } catch (error) {
    console.warn('Could not load categories from content layer, returning fallback data');
    return getFallbackCategories();
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const products = await getCollection('products');
    return products.map(prod => prod.data);
  } catch (error) {
    console.warn('Could not load products from content layer, returning fallback data');
    return getFallbackProducts();
  }
}

export async function getProductVariants(): Promise<ProductVariant[]> {
  try {
    const variants = await getCollection('product-variants');
    return variants.map(variant => variant.data);
  } catch (error) {
    console.warn('Could not load product variants from content layer, returning fallback data');
    return getFallbackProductVariants();
  }
}

export async function getProductsWithVariants(): Promise<ProductWithVariants[]> {
  const [products, variants, categories] = await Promise.all([
    getProducts(),
    getProductVariants(),
    getCategories()
  ]);

  // Create a map for easy lookup
  const productVariants = variants.reduce((acc, variant) => {
    if (!acc[variant.product_id]) {
      acc[variant.product_id] = [];
    }
    acc[variant.product_id].push(variant);
    return acc;
  }, {} as Record<string, ProductVariant[]>);

  // Enhance products with variants and category data
  return products.map(product => {
    const productVariantsData = productVariants[product.id] || [];
    const category = categories.find(cat => cat.id === product.category_id);
    
    return {
      ...product,
      variants: productVariantsData,
      category
    };
  });
}

// Fallback data for development/testing when Supabase is not available
function getFallbackCategories(): Category[] {
  return [
    {
      id: 'cat-1',
      name: 'Sashimi',
      description: 'Tranches de poisson frais sans riz',
      image_url: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg',
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat-2',
      name: 'Nigiri',
      description: 'Riz vinaigré surmonté de poisson',
      image_url: 'https://images.pexels.com/photos/2323398/pexels-photo-2323398.jpeg',
      sort_order: 2,
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'cat-3',
      name: 'Maki',
      description: 'Rouleaux de sushi traditionnels',
      image_url: 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg',
      sort_order: 3,
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];
}

function getFallbackProducts(): Product[] {
  return [
    {
      id: 'prod-1',
      category_id: 'cat-1',
      name: 'Sashimi Saumon',
      description: '6 tranches de saumon frais de Norvège',
      base_price: 12.90,
      image_url: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg',
      is_popular: true,
      is_available: true,
      allergens: ['poisson'],
      nutritional_info: {},
      preparation_time: 10,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'prod-2',
      category_id: 'cat-2',
      name: 'Nigiri Saumon',
      description: 'Riz vinaigré surmonté de saumon frais',
      base_price: 3.80,
      image_url: 'https://images.pexels.com/photos/2323398/pexels-photo-2323398.jpeg',
      is_popular: true,
      is_available: true,
      allergens: ['poisson', 'gluten'],
      nutritional_info: {},
      preparation_time: 5,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'prod-3',
      category_id: 'cat-3',
      name: 'Maki Saumon',
      description: '6 pièces au saumon frais et avocat',
      base_price: 7.90,
      image_url: 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg',
      is_popular: false,
      is_available: true,
      allergens: ['poisson', 'gluten'],
      nutritional_info: {},
      preparation_time: 8,
      sort_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
}

function getFallbackProductVariants(): ProductVariant[] {
  return [
    {
      id: 'var-1',
      product_id: 'prod-1',
      name: 'Standard (6 pièces)',
      price_modifier: 0.00,
      is_default: true,
      is_available: true,
      sort_order: 1
    },
    {
      id: 'var-2',
      product_id: 'prod-1',
      name: 'Large (12 pièces)',
      price_modifier: 12.00,
      is_default: false,
      is_available: true,
      sort_order: 2
    }
  ];
}