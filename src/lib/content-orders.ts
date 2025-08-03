import { getCollection } from 'astro:content';

// New orders service using Astro Content Layer instead of Supabase runtime
export interface OrderWithItems {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  order_type: 'dine_in' | 'takeaway' | 'delivery';
  total_amount: number;
  delivery_fee: number;
  loyalty_points_used: number;
  loyalty_points_earned: number;
  special_instructions: string;
  delivery_address: string;
  scheduled_time: Date;
  created_at: Date;
  updated_at: Date;
  items: Array<{
    id: string;
    order_id: string;
    product_id: string;
    variant_id: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    special_instructions: string;
    product: {
      name: string;
      image_url: string;
    };
    variant?: {
      name: string;
    };
  }>;
}

export class ContentOrderService {
  static async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    const orders = await getCollection('orders');
    const orderItems = await getCollection('order_items');
    const products = await getCollection('products');
    const variants = await getCollection('product_variants');
    
    // Filter orders for this user
    const userOrders = orders.filter(order => order.data.user_id === userId);
    
    // Build orders with items
    return userOrders.map(order => {
      const items = orderItems
        .filter(item => item.data.order_id === order.data.id)
        .map(item => {
          const product = products.find(p => p.data.id === item.data.product_id);
          const variant = item.data.variant_id 
            ? variants.find(v => v.data.id === item.data.variant_id)
            : null;
          
          return {
            ...item.data,
            product: {
              name: product?.data.name || 'Produit inconnu',
              image_url: product?.data.image_url || ''
            },
            variant: variant ? { name: variant.data.name } : undefined
          };
        });
      
      return {
        ...order.data,
        items
      } as OrderWithItems;
    });
  }

  static async getOrder(orderId: string): Promise<OrderWithItems | null> {
    const orders = await getCollection('orders');
    const orderItems = await getCollection('order_items');
    const products = await getCollection('products');
    const variants = await getCollection('product_variants');
    
    const order = orders.find(o => o.data.id === orderId);
    if (!order) return null;
    
    const items = orderItems
      .filter(item => item.data.order_id === orderId)
      .map(item => {
        const product = products.find(p => p.data.id === item.data.product_id);
        const variant = item.data.variant_id 
          ? variants.find(v => v.data.id === item.data.variant_id)
          : null;
        
        return {
          ...item.data,
          product: {
            name: product?.data.name || 'Produit inconnu',
            image_url: product?.data.image_url || ''
          },
          variant: variant ? { name: variant.data.name } : undefined
        };
      });
    
    return {
      ...order.data,
      items
    } as OrderWithItems;
  }

  static async getAllOrders(): Promise<OrderWithItems[]> {
    const orders = await getCollection('orders');
    const orderItems = await getCollection('order_items');
    const products = await getCollection('products');
    const variants = await getCollection('product_variants');
    
    return orders.map(order => {
      const items = orderItems
        .filter(item => item.data.order_id === order.data.id)
        .map(item => {
          const product = products.find(p => p.data.id === item.data.product_id);
          const variant = item.data.variant_id 
            ? variants.find(v => v.data.id === item.data.variant_id)
            : null;
          
          return {
            ...item.data,
            product: {
              name: product?.data.name || 'Produit inconnu',
              image_url: product?.data.image_url || ''
            },
            variant: variant ? { name: variant.data.name } : undefined
          };
        });
      
      return {
        ...order.data,
        items
      } as OrderWithItems;
    });
  }

  // Note: Order creation, updates, etc. would need to be handled by API endpoints
  // or form submissions since Content Layer is read-only at runtime
}