import { projectId, publicAnonKey } from '../supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba`;

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  last_message_at: string;
  created_at: string;
  buyer?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
  seller?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
  listing?: {
    id: string;
    title: string;
    price: number;
    images: string[];
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
}

export class MessagingService {
  // Get unread messages count
  static async getUnreadCount(accessToken: string): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/messages/unread-count`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, count: 0, error: data.error };
      }

      return data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return { success: false, count: 0, error: 'Network error' };
    }
  }

  // Get user's conversations
  static async getConversations(accessToken: string): Promise<{ success: boolean; conversations: Conversation[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/conversations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, conversations: [], error: data.error };
      }

      return data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return { success: false, conversations: [], error: 'Network error' };
    }
  }

  // Get or create conversation
  static async getOrCreateConversation(accessToken: string, listingId: string, sellerId: string): Promise<{ success: boolean; conversation?: Conversation; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ listingId, sellerId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get messages in a conversation
  static async getMessages(accessToken: string, conversationId: string): Promise<{ success: boolean; messages: Message[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, messages: [], error: data.error };
      }

      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { success: false, messages: [], error: 'Network error' };
    }
  }

  // Send a message
  static async sendMessage(accessToken: string, conversationId: string, content: string, images?: File[]): Promise<{ success: boolean; message?: Message; error?: string }> {
    try {
      let response;

      if (images && images.length > 0) {
        // Send with images using FormData
        const formData = new FormData();
        formData.append('conversationId', conversationId);
        formData.append('content', content);
        
        // Add images
        images.forEach((image, index) => {
          formData.append(`image${index}`, image);
        });

        response = await fetch(`${API_BASE}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            // Don't set Content-Type, let browser set it with boundary for multipart
          },
          body: formData,
        });
      } else {
        // Send text-only message using JSON
        response = await fetch(`${API_BASE}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ conversationId, content }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Delete conversations (single or multiple)
  static async deleteConversations(accessToken: string, conversationIds: string[]): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/conversations`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ conversationIds }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error };
      }

      return data;
    } catch (error) {
      console.error('Error deleting conversations:', error);
      return { success: false, error: 'Network error' };
    }
  }
}