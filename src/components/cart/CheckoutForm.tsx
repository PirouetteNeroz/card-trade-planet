
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CartItem } from "@/lib/api";
import { createSupabaseOrder } from "@/lib/supabase-utils";
import { CreditCard, Loader2 } from "lucide-react";

interface CheckoutFormProps {
  cart: CartItem[];
  subtotal: number;
  onOrderComplete: () => void;
}

export function CheckoutForm({ cart, subtotal, onOrderComplete }: CheckoutFormProps) {
  const [username, setUsername] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      console.log("Submitting order with:", { username, cart, totalPrice: subtotal });
      
      // Create the order using Supabase
      const order = await createSupabaseOrder(username, cart, subtotal);
      
      console.log("Order response:", order);
      
      onOrderComplete();
      
      toast({
        title: "Commande envoyée avec succès !",
        description: `Votre commande #${order.order_id} a été reçue.`,
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

  return (
    <>
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
    </>
  );
}
