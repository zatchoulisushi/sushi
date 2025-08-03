import type { ProductWithVariants } from './products';

export interface CartItem {
  id: string;
  product: ProductWithVariants;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  loyaltyPointsUsed: number;
  loyaltyDiscount: number;
  total: number;
}

export class CartService {
  private static STORAGE_KEY = 'osushi_cart';

  static getCart(): Cart {
    if (typeof window === 'undefined') {
      return this.getEmptyCart();
    }

    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      return this.getEmptyCart();
    }

    try {
      return JSON.parse(stored);
    } catch {
      return this.getEmptyCart();
    }
  }

  static saveCart(cart: Cart) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    this.notifyCartUpdate();
  }

  static addItem(product: ProductWithVariants, variantId?: string, quantity: number = 1, specialInstructions?: string) {
    const cart = this.getCart();
    const itemId = `${product.id}-${variantId || 'default'}`;
    
    const existingItem = cart.items.find(item => item.id === itemId);
    const unitPrice = this.calculateItemPrice(product, variantId);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.totalPrice = existingItem.quantity * unitPrice;
      if (specialInstructions) {
        existingItem.specialInstructions = specialInstructions;
      }
    } else {
      cart.items.push({
        id: itemId,
        product,
        variantId,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
        specialInstructions
      });
    }

    this.updateCartTotals(cart);
    this.saveCart(cart);
    return cart;
  }

  static updateItemQuantity(itemId: string, quantity: number) {
    const cart = this.getCart();
    const item = cart.items.find(item => item.id === itemId);
    
    if (item) {
      if (quantity <= 0) {
        cart.items = cart.items.filter(item => item.id !== itemId);
      } else {
        item.quantity = quantity;
        item.totalPrice = item.quantity * item.unitPrice;
      }
      
      this.updateCartTotals(cart);
      this.saveCart(cart);
    }
    
    return cart;
  }

  static removeItem(itemId: string) {
    const cart = this.getCart();
    cart.items = cart.items.filter(item => item.id !== itemId);
    this.updateCartTotals(cart);
    this.saveCart(cart);
    return cart;
  }

  static clearCart() {
    const emptyCart = this.getEmptyCart();
    this.saveCart(emptyCart);
    return emptyCart;
  }

  static applyLoyaltyPoints(points: number) {
    const cart = this.getCart();
    cart.loyaltyPointsUsed = points;
    cart.loyaltyDiscount = points * 0.01; // 1 point = 1 centime
    this.updateCartTotals(cart);
    this.saveCart(cart);
    return cart;
  }

  private static calculateItemPrice(product: ProductWithVariants, variantId?: string): number {
    let price = product.base_price;
    
    if (variantId) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant) {
        price += variant.price_modifier;
      }
    }
    
    return price;
  }

  private static updateCartTotals(cart: Cart) {
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    cart.total = cart.subtotal + cart.deliveryFee - cart.loyaltyDiscount;
  }

  private static getEmptyCart(): Cart {
    return {
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      loyaltyPointsUsed: 0,
      loyaltyDiscount: 0,
      total: 0
    };
  }

  private static notifyCartUpdate() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }

  static getItemCount(): number {
    const cart = this.getCart();
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}