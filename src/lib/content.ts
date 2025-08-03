import { getCollection, type CollectionEntry } from 'astro:content';

export type Category = CollectionEntry<'categories'>;
export type Product = CollectionEntry<'products'>;

export interface ProductWithCategory extends Product {
  category: Category;
}

export class ContentService {
  static async getCategories(): Promise<Category[]> {
    const categories = await getCollection('categories');
    return categories
      .filter(category => category.data.is_active)
      .sort((a, b) => a.data.sort_order - b.data.sort_order);
  }

  static async getProducts(categoryId?: string): Promise<ProductWithCategory[]> {
    const [products, categories] = await Promise.all([
      getCollection('products'),
      getCollection('categories')
    ]);

    // Create a map for faster category lookup
    const categoriesMap = new Map(
      categories.map(cat => [cat.id, cat])
    );

    let filteredProducts = products.filter(product => product.data.is_available);
    
    if (categoryId) {
      filteredProducts = filteredProducts.filter(product => product.data.category_id === categoryId);
    }

    // Add category information to each product
    const productsWithCategories: ProductWithCategory[] = filteredProducts.map(product => ({
      ...product,
      category: categoriesMap.get(product.data.category_id)!
    }));

    return productsWithCategories.sort((a, b) => a.data.sort_order - b.data.sort_order);
  }

  static async getProduct(id: string): Promise<ProductWithCategory | null> {
    const [products, categories] = await Promise.all([
      getCollection('products'),
      getCollection('categories')
    ]);

    const product = products.find(p => p.id === id);
    if (!product) return null;

    const category = categories.find(cat => cat.id === product.data.category_id);
    if (!category) return null;

    return {
      ...product,
      category
    };
  }

  static async getProductsByCategory(categoryId: string): Promise<ProductWithCategory[]> {
    return this.getProducts(categoryId);
  }

  static async searchProducts(query: string): Promise<ProductWithCategory[]> {
    const products = await this.getProducts();
    const searchTerm = query.toLowerCase();
    
    return products.filter(product => 
      product.data.name.toLowerCase().includes(searchTerm) ||
      product.data.description.toLowerCase().includes(searchTerm)
    );
  }

  static async getPopularProducts(): Promise<ProductWithCategory[]> {
    const products = await this.getProducts();
    return products.filter(product => product.data.is_popular);
  }

  static calculatePrice(product: Product, variantId?: string): number {
    // For now, just return base price
    // This could be extended to handle variants if needed
    return product.data.base_price;
  }
}