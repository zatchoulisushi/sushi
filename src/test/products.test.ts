import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase module
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

import { ProductService } from '../lib/products';

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should fetch active categories ordered by sort_order', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Sashimi', sort_order: 1, is_active: true },
        { id: 'cat-2', name: 'Nigiri', sort_order: 2, is_active: true },
      ];

      const { supabase } = await import('../lib/supabase');
      
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockCategories, error: null }),
      };

      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await ProductService.getCategories();

      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(mockQuery.select).toHaveBeenCalledWith('*');
      expect(mockQuery.eq).toHaveBeenCalledWith('is_active', true);
      expect(mockQuery.order).toHaveBeenCalledWith('sort_order');
      expect(result).toEqual(mockCategories);
    });

    it('should throw error when database query fails', async () => {
      const { supabase } = await import('../lib/supabase');
      
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ 
          data: null, 
          error: new Error('Database error') 
        }),
      };

      (supabase.from as any).mockReturnValue(mockQuery);

      await expect(ProductService.getCategories()).rejects.toThrow('Database error');
    });
  });

  describe('getProducts', () => {
    it('should fetch all products with category and variants', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Sashimi Saumon',
          base_price: 12.90,
          is_available: true,
          category: { id: 'cat-1', name: 'Sashimi' },
          variants: [
            { id: 'var-1', name: 'Standard', price_modifier: 0 }
          ],
        },
      ];

      const { supabase } = await import('../lib/supabase');
      
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProducts, error: null }),
      };

      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await ProductService.getProducts();

      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(mockQuery.select).toHaveBeenCalledWith(`
        *,
        category:categories(*),
        variants:product_variants(*)
      `);
      expect(mockQuery.eq).toHaveBeenCalledWith('is_available', true);
      expect(mockQuery.order).toHaveBeenCalledWith('sort_order');
      expect(result).toEqual(mockProducts);
    });

    it('should filter products by category when categoryId provided', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          category_id: 'cat-1',
          name: 'Sashimi Saumon',
        },
      ];

      const { supabase } = await import('../lib/supabase');
      
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProducts, error: null }),
      };

      (supabase.from as any).mockReturnValue(mockQuery);

      await ProductService.getProducts('cat-1');

      expect(mockQuery.eq).toHaveBeenCalledWith('is_available', true);
      expect(mockQuery.eq).toHaveBeenCalledWith('category_id', 'cat-1');
    });
  });

  describe('getProduct', () => {
    it('should fetch single product by id', async () => {
      const mockProduct = {
        id: 'product-1',
        name: 'Sashimi Saumon',
        base_price: 12.90,
        category: { id: 'cat-1', name: 'Sashimi' },
        variants: [],
      };

      const { supabase } = await import('../lib/supabase');
      
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockProduct, error: null }),
      };

      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await ProductService.getProduct('product-1');

      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'product-1');
      expect(mockQuery.single).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });
  });

  describe('searchProducts', () => {
    it('should search products by name and description', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Sashimi Saumon',
          description: 'Tranches de saumon frais',
        },
      ];

      const { supabase } = await import('../lib/supabase');
      
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockProducts, error: null }),
      };

      (supabase.from as any).mockReturnValue(mockQuery);

      const result = await ProductService.searchProducts('saumon');

      expect(mockQuery.or).toHaveBeenCalledWith('name.ilike.%saumon%,description.ilike.%saumon%');
      expect(result).toEqual(mockProducts);
    });
  });

  describe('calculatePrice', () => {
    it('should return base price when no variant provided', () => {
      const product = { base_price: 12.90 } as any;
      
      const price = ProductService.calculatePrice(product);
      
      expect(price).toBe(12.90);
    });

    it('should return base price when variant not implemented', () => {
      const product = { base_price: 12.90 } as any;
      
      const price = ProductService.calculatePrice(product, 'variant-1');
      
      expect(price).toBe(12.90);
    });
  });
});