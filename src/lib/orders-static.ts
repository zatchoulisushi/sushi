// Stub orders service to replace Supabase orders
// This provides the same interface but with placeholder functionality

export interface Order {
  id: string;
  user_id: string | null;
  order_number: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  total_amount: number;
  delivery_fee: number;
  loyalty_points_used: number;
  loyalty_points_earned: number;
  special_instructions: string;
  delivery_address: string;
  scheduled_time: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions: string;
}

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
    console.warn('OrderService.createOrder - Static site mode: Order creation not available');
    throw new Error('Order creation not available in static site mode. Please contact us directly.');
  }

  static async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    console.warn('OrderService.getUserOrders - Static site mode: Order history not available');
    return [];
  }

  static async getOrder(orderId: string): Promise<OrderWithItems | null> {
    console.warn('OrderService.getOrder - Static site mode: Order details not available');
    return null;
  }

  static async updateOrderStatus(orderId: string, status: Order['status']) {
    console.warn('OrderService.updateOrderStatus - Static site mode: Order updates not available');
    throw new Error('Order updates not available in static site mode');
  }
}