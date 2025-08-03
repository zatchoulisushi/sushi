// Client-side content service that uses pre-loaded content data
export class ClientContentService {
  private static productsData: any[] = [];
  private static categoriesData: any[] = [];

  static initialize(products: any[], categories: any[]) {
    this.productsData = products;
    this.categoriesData = categories;
  }

  static getProduct(id: string) {
    const product = this.productsData.find(p => p.id === id);
    if (!product) return null;

    const category = this.categoriesData.find(cat => cat.id === product.data.category_id);
    return {
      ...product,
      category
    };
  }

  static getProducts(categoryId?: string) {
    let filtered = this.productsData.filter(product => product.data.is_available);
    
    if (categoryId) {
      filtered = filtered.filter(product => product.data.category_id === categoryId);
    }

    return filtered.map(product => ({
      ...product,
      category: this.categoriesData.find(cat => cat.id === product.data.category_id)
    }));
  }

  static searchProducts(query: string) {
    const searchTerm = query.toLowerCase();
    const filtered = this.productsData.filter(product => 
      product.data.name.toLowerCase().includes(searchTerm) ||
      product.data.description.toLowerCase().includes(searchTerm)
    );

    return filtered.map(product => ({
      ...product,
      category: this.categoriesData.find(cat => cat.id === product.data.category_id)
    }));
  }
}