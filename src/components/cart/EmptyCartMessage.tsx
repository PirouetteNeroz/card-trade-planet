
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyCartMessage() {
  const navigate = useNavigate();
  
  return (
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
  );
}
