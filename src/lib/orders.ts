import { supabase } from './supabase';
import { CartService, type Cart } from './cart';
import { AuthService } from './auth';
import type { Database } from './supabase';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

export interface OrderWithItems extends Order {
  items: (OrderItem & {
    product: {
      name: string;
      image_url: string;
    };
    variant?: {
      name: string;
    };
  })[];
}

export interface CreateOrderData {
  orderType: 'dine_in' | 'takeaway' | 'delivery';
  deliveryAddress?: string;
  scheduledTime?: string;
  specialInstructions?: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
}

export class OrderService {
  static async createOrder(orderData: CreateOrderData): Promise<Order> {
    const cart = CartService.getCart();
    const user = await AuthService.getCurrentUser();
    
    if (cart.items.length === 0) {
      throw new Error('Le panier est vide');
    }

    // Generate order number
    const orderNumber = this.generateOrderNumber();

    // Calculate loyalty points earned (1 point per euro spent)
    const loyaltyPointsEarned = Math.floor(cart.total);

    const orderInsert = {
      user_id: user?.id || 'guest',
      order_number: orderNumber,
      status: 'pending' as const,
      order_type: orderData.orderType,
      total_amount: cart.total,
      delivery_fee: cart.deliveryFee,
      loyalty_points_used: cart.loyaltyPointsUsed,
      loyalty_points_earned: loyaltyPointsEarned,
      special_instructions: orderData.specialInstructions || '',
      delivery_address: orderData.deliveryAddress || '',
      scheduled_time: orderData.scheduledTime || new Date().toISOString(),
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsert)
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const orderItems = cart.items.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      variant_id: item.variantId || null,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
      special_instructions: item.specialInstructions || ''
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Update user loyalty points if authenticated
    if (user) {
      await this.updateUserLoyaltyPoints(user.id, loyaltyPointsEarned, cart.loyaltyPointsUsed);
    }

    // Clear cart
    CartService.clearCart();

    return order;
  }

  static async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(name, image_url),
          variant:product_variants(name)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as OrderWithItems[];
  }

  static async getOrder(orderId: string): Promise<OrderWithItems> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          product:products(name, image_url),
          variant:product_variants(name)
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data as OrderWithItems;
  }

  static async updateOrderStatus(orderId: string, status: Order['status']) {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;
  }

  private static generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `OS${year}${month}${day}${random}`;
  }

  private static async updateUserLoyaltyPoints(userId: string, pointsEarned: number, pointsUsed: number) {
    // Get current user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('loyalty_points, loyalty_tier')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const newPoints = user.loyalty_points + pointsEarned - pointsUsed;
    const newTier = this.calculateLoyaltyTier(newPoints);

    // Update user points and tier
    const { error: updateError } = await supabase
      .from('users')
      .update({
        loyalty_points: newPoints,
        loyalty_tier: newTier,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Record loyalty transactions
    if (pointsEarned > 0) {
      await supabase.from('loyalty_transactions').insert({
        user_id: userId,
        points_change: pointsEarned,
        transaction_type: 'earned',
        description: `Points gagnés sur commande`
      });
    }

    if (pointsUsed > 0) {
      await supabase.from('loyalty_transactions').insert({
        user_id: userId,
        points_change: -pointsUsed,
        transaction_type: 'redeemed',
        description: `Points utilisés sur commande`
      });
    }
  }

  private static calculateLoyaltyTier(points: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (points >= 5000) return 'platinum';
    if (points >= 2000) return 'gold';
    if (points >= 500) return 'silver';
    return 'bronze';
  }
}