import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartService } from '../lib/cart';
import type { ProductWithVariants } from '../lib/products';

describe('CartService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage and reset mocks
    const localStorageMock = window.localStorage as any;
    localStorageMock.clear();
    localStorageMock.getItem.mockReturnValue(null);
  });

  const mockProduct: ProductWithVariants = {
    id: 'product-1',
    category_id: 'cat-1',
    name: 'Sashimi Saumon',
    description: 'Tranches de saumon frais',
    base_price: 12.90,
    image_url: 'image.jpg',
    is_popular: true,
    is_available: true,
    allergens: ['poisson'],
    nutritional_info: {},
    preparation_time: 10,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    variants: [
      {
        id: 'variant-1',
        product_id: 'product-1',
        name: 'Standard (6 pièces)',
        price_modifier: 0,
        is_default: true,
        is_available: true,
        sort_order: 1,
      },
      {
        id: 'variant-2',
        product_id: 'product-1',
        name: 'Large (12 pièces)',
        price_modifier: 12.00,
        is_default: false,
        is_available: true,
        sort_order: 2,
      },
    ],
    category: {
      id: 'cat-1',
      name: 'Sashimi',
      description: 'Tranches de poisson frais',
      image_url: 'cat-image.jpg',
      sort_order: 1,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
    },
  };

  describe('getCart', () => {
    it('should return empty cart when localStorage is empty', () => {
      const cart = CartService.getCart();
      
      expect(cart).toEqual({
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        loyaltyPointsUsed: 0,
        loyaltyDiscount: 0,
        total: 0,
      });
    });

    it('should return stored cart from localStorage', () => {
      const storedCart = {
        items: [{
          id: 'product-1-default',
          product: mockProduct,
          quantity: 2,
          unitPrice: 12.90,
          totalPrice: 25.80,
        }],
        subtotal: 25.80,
        deliveryFee: 0,
        loyaltyPointsUsed: 0,
        loyaltyDiscount: 0,
        total: 25.80,
      };

      const localStorageMock = window.localStorage as any;
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedCart));

      const cart = CartService.getCart();
      expect(cart.items).toHaveLength(1);
      expect(cart.subtotal).toBe(25.80);
    });
  });

  describe('addItem', () => {
    it('should add new item to empty cart', () => {
      const cart = CartService.addItem(mockProduct, undefined, 2);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0]).toEqual({
        id: 'product-1-default',
        product: mockProduct,
        variantId: undefined,
        quantity: 2,
        unitPrice: 12.90,
        totalPrice: 25.80,
      });
      expect(cart.subtotal).toBe(25.80);
      expect(cart.total).toBe(25.80);
    });

    it('should increase quantity for existing item', () => {
      // Start with empty cart, add an item
      CartService.addItem(mockProduct, undefined, 1);
      
      // Get the current cart to understand its state
      let cart = CartService.getCart();
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(1);
      
      // Add same item again
      cart = CartService.addItem(mockProduct, undefined, 2);

      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(3);
      expect(cart.items[0].totalPrice).toBe(38.70);
    });

    it('should calculate price with variant modifier', () => {
      const cart = CartService.addItem(mockProduct, 'variant-2', 1);

      expect(cart.items[0].unitPrice).toBe(24.90); // 12.90 + 12.00
      expect(cart.items[0].totalPrice).toBe(24.90);
    });
  });

  describe('updateItemQuantity', () => {
    beforeEach(() => {
      // Start fresh for each test
      CartService.clearCart();
      CartService.addItem(mockProduct, undefined, 2);
    });

    it('should update item quantity', () => {
      const cart = CartService.updateItemQuantity('product-1-default', 5);

      expect(cart.items[0].quantity).toBe(5);
      expect(cart.items[0].totalPrice).toBe(64.50);
      expect(cart.subtotal).toBe(64.50);
    });

    it('should remove item when quantity is 0', () => {
      const cart = CartService.updateItemQuantity('product-1-default', 0);

      expect(cart.items).toHaveLength(0);
      expect(cart.subtotal).toBe(0);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      CartService.addItem(mockProduct, undefined, 2);
      const cart = CartService.removeItem('product-1-default');

      expect(cart.items).toHaveLength(0);
      expect(cart.subtotal).toBe(0);
    });
  });

  describe('applyLoyaltyPoints', () => {
    it('should apply loyalty points discount', () => {
      CartService.clearCart();
      CartService.addItem(mockProduct, undefined, 2);
      const cart = CartService.applyLoyaltyPoints(100);

      expect(cart.loyaltyPointsUsed).toBe(100);
      expect(cart.loyaltyDiscount).toBe(1.00); // 100 points = 1€
      expect(cart.total).toBe(24.80); // 25.80 - 1.00
    });
  });

  describe('getItemCount', () => {
    it('should return total item count', () => {
      CartService.clearCart();
      CartService.addItem(mockProduct, undefined, 2);
      CartService.addItem({ ...mockProduct, id: 'product-2' }, undefined, 3);

      const count = CartService.getItemCount();
      expect(count).toBe(5);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      CartService.addItem(mockProduct, undefined, 2);
      const cart = CartService.clearCart();

      expect(cart.items).toHaveLength(0);
      expect(cart.subtotal).toBe(0);
      expect(cart.total).toBe(0);
    });
  });
});