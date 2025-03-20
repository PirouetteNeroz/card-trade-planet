
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CartItem from "@/components/CartItem";
import { CartItem as CartItemType, loadCartFromLocalStorage, saveCartToLocalStorage, createOrder } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, CreditCard, ArrowRight, Loader2 } from "lucide-react";

export default function Cart() {
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [username, setUsername] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
    
    toast({
      title: "Article supprimé",
      description: "L'article a été retiré de votre panier.",
      duration: 3000,
    });
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmitOrder = async () => {
    if (!username.trim()) {
      toast({
        title: "Nom d'utilisateur requis",
        description: "Veuillez entrer votre nom d'utilisateur avant de soumettre la commande.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    if (cart.length === 0) {
      toast({
        title: "Panier vide",
        description: "Votre panier est vide. Ajoutez des articles avant de passer commande.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Create the order
      const subtotal = calculateSubtotal();
      const orderId = await createOrder(username, cart, subtotal);
      
      // Clear the cart
      setCart([]);
      saveCartToLocalStorage([]);
      
      toast({
        title: "Commande envoyée avec succès !",
        description: `Votre commande #${orderId} a été reçue.`,
        duration: 5000,
      });
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre commande. Veuillez réessayer.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 page-transition">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Votre Panier</h1>
        
        {cart.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-8 text-center animate-fade-in">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <ShoppingCart className="h-10 w-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-medium mb-4">Votre panier est vide</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Explorez notre collection et ajoutez des cartes à votre panier.
              </p>
              <Button onClick={() => navigate("/inventory")}>
                Parcourir l'inventaire
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-grow bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 animate-fade-in">
              <h2 className="text-xl font-medium mb-4">Articles ({cart.length})</h2>
              
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {cart.map((item) => (
                  <CartItem
                    key={item.id}
                    id={item.id}
                    name={item.name_fr || item.name_en}
                    image_url={item.image_url}
                    price={item.price}
                    quantity={item.quantity}
                    condition={item.condition}
                    expansion={item.expansion}
                    onUpdateQuantity={updateCartItemQuantity}
                    onRemove={removeCartItem}
                  />
                ))}
              </div>
            </div>
            
            <div className="lg:w-80 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 h-fit animate-fade-in">
              <h2 className="text-xl font-medium mb-6">Récapitulatif</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Sous-total</span>
                  <span>{formatPrice(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between font-medium text-lg">
                  <span>Total</span>
                  <span>{formatPrice(calculateSubtotal())}</span>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="username">Votre nom d'utilisateur</Label>
                  <Input
                    id="username"
                    placeholder="Entrez votre nom d'utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmitOrder}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Envoyer la commande
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
      
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Card Planet. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
