
import { useState } from "react";
import CartItem from "@/components/CartItem";
import { CartItem as CartItemType } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface CartItemsListProps {
  items: CartItemType[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export function CartItemsList({ items, onUpdateQuantity, onRemoveItem }: CartItemsListProps) {
  const { toast } = useToast();
  
  const handleRemoveItem = (id: string) => {
    onRemoveItem(id);
    
    toast({
      title: "Article supprimé",
      description: "L'article a été retiré de votre panier.",
      duration: 3000,
    });
  };
  
  return (
    <div className="flex-grow bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 animate-fade-in">
      <h2 className="text-xl font-medium mb-4">Articles ({items.length})</h2>
      
      <div className="divide-y divide-slate-200 dark:divide-slate-700">
        {items.map((item) => (
          <CartItem
            key={item.id}
            id={item.id}
            name={item.name_fr || item.name_en}
            image_url={item.image_url}
            price={item.price}
            quantity={item.quantity}
            condition={item.condition}
            expansion={item.expansion}
            collectorNumber={item.collectorNumber}
            language={item.language}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={handleRemoveItem}
          />
        ))}
      </div>
    </div>
  );
}
