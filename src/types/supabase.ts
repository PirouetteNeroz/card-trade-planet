
// Custom type definitions for Supabase data
export interface Profile {
  id: string;
  username: string;
  created_at: string;
}

export interface SavedCart {
  id: string;
  user_id: string;
  name: string;
  items: any[];
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_id: string;
  user_id: string | null;
  username: string;
  items: any[];
  total_price: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}
