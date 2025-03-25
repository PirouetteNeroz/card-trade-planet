
import { supabase } from "@/integrations/supabase/client";
import { Order, Profile, SavedCart } from "@/types/supabase";
import { v4 as uuidv4 } from 'uuid';
import { CartItem } from "./api";

// Profile functions
export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data as Profile;
}

// Saved carts functions
export async function getSavedCarts() {
  const { data, error } = await supabase
    .from('saved_carts')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching saved carts:', error);
    return [];
  }
  
  return data as SavedCart[];
}

export async function saveCart(name: string, items: CartItem[], totalPrice: number) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Convert cart items to a format compatible with jsonb
  const jsonItems = JSON.parse(JSON.stringify(items));
  
  const { data, error } = await supabase
    .from('saved_carts')
    .insert({
      user_id: user.id,
      name,
      items: jsonItems,
      total_price: totalPrice
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error saving cart:', error);
    throw error;
  }
  
  return data as SavedCart;
}

export async function deleteSavedCart(id: string) {
  const { error } = await supabase
    .from('saved_carts')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting saved cart:', error);
    throw error;
  }
  
  return true;
}

// Orders functions
export async function createSupabaseOrder(username: string, items: CartItem[], totalPrice: number) {
  const { data: { user } } = await supabase.auth.getUser();
  
  // Generate a unique order ID
  const orderId = `ORD-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 1000)}`;
  
  // Convert cart items to a format compatible with jsonb
  const jsonItems = JSON.parse(JSON.stringify(items));
  
  console.log('Creating order with data:', {
    order_id: orderId,
    user_id: user?.id || null,
    username,
    items: jsonItems,
    total_price: totalPrice
  });

  const { data, error } = await supabase
    .from('orders')
    .insert({
      order_id: orderId,
      user_id: user?.id || null,
      username,
      items: jsonItems,
      total_price: totalPrice,
      status: 'pending'
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  
  console.log('Order created successfully:', data);
  return data as Order;
}

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
  
  return data as Order[];
}

export async function getUserOrders() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
  
  return data as Order[];
}

export async function updateOrderStatus(id: string, status: Order['status']) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
  
  return data as Order;
}
