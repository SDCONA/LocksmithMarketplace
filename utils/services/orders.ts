import { projectId, publicAnonKey } from '../supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba`;

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  payment_method?: string;
  payment_id?: string;
  shipping_address_id?: string;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  listing_id?: string;
  product_name: string;
  product_image?: string;
  price: number;
  quantity: number;
  seller_id?: string;
  created_at: string;
}

export class OrderService {
  // Create order
  static async createOrder(
    accessToken: string,
    orderData: {
      items: any[];
      total: number;
      shippingAddressId?: string;
      paymentMethod?: string;
    }
  ): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to create order' };
      }

      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get user orders
  static async getOrders(accessToken: string): Promise<{ success: boolean; orders?: Order[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch orders' };
      }

      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get order by ID
  static async getOrder(accessToken: string, orderId: string): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch order' };
      }

      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      return { success: false, error: 'Network error' };
    }
  }
}
