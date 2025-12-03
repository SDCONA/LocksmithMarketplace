import { projectId, publicAnonKey } from '../supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba`;

export class VehicleService {
  // Get vehicle years
  static async getYears(): Promise<{ success: boolean; years?: number[]; error?: string }> {
    try {
      const response = await fetch(`${API_BASE}/vehicles/years`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch years' };
      }

      return data;
    } catch (error) {
      console.error('Error fetching years:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get vehicle makes
  static async getMakes(year?: number): Promise<{ success: boolean; makes?: string[]; error?: string }> {
    try {
      const url = year ? `${API_BASE}/vehicles/makes?year=${year}` : `${API_BASE}/vehicles/makes`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch makes' };
      }

      return data;
    } catch (error) {
      console.error('Error fetching makes:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get vehicle models
  static async getModels(year?: number, make?: string): Promise<{ success: boolean; models?: string[]; error?: string }> {
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year.toString());
      if (make) params.append('make', make);
      
      const url = `${API_BASE}/vehicles/models${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to fetch models' };
      }

      return data;
    } catch (error) {
      console.error('Error fetching models:', error);
      return { success: false, error: 'Network error' };
    }
  }
}
