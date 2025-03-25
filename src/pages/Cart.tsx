
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { CartItem, loadCartFromLocalStorage, saveCartToLocalStorage } from "@/lib/api";
import { EmptyCartMessage } from "@/components/cart/EmptyCartMessage";
import { CartItemsList } from "@/components/cart/CartItemsList";
import { CartSummary } from "@/components/cart/CartSummary";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { CartFooter } from "@/components/cart/CartFooter";

export default function Cart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const loadedCart = loadCartFromLocalStorage();
    setCart(loadedCart);
  }, []);

  const updateCartItemQuantity = (id: string, quantity: number) => {
    const newCart = cart.map(item => 
      item.id === id ? { ...item, quantity } : item
    );
    setCart(newCart);
    saveCartToLocalStorage(newCart);
  };

  const removeCartItem = (id: string) => {
    const newCart = cart.filter(item => item.id !== id);
    setCart(newCart);
    saveCartToLocalStorage(newCart);
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleOrderComplete = () => {
    setCart([]);
    saveCartToLocalStorage([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 page-transition">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Votre Panier</h1>
        
        {cart.length === 0 ? (
          <EmptyCartMessage />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <CartItemsList 
              items={cart} 
              onUpdateQuantity={updateCartItemQuantity} 
              onRemoveItem={removeCartItem} 
            />
            
            <div className="lg:w-80 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 h-fit animate-fade-in">
              <h2 className="text-xl font-medium mb-6">Récapitulatif</h2>
              
              <CartSummary subtotal={calculateSubtotal()} />
              
              <CheckoutForm 
                cart={cart} 
                subtotal={calculateSubtotal()} 
                onOrderComplete={handleOrderComplete} 
              />
            </div>
          </div>
        )}
      </main>
      
      <CartFooter />
    </div>
  );
}
