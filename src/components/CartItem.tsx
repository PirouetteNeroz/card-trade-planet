
import { useState } from "react";
import { Trash2, Plus, Minus, Hash, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CartItemProps {
  id: string;
  name: string;
  image_url?: string;
  price: number;
  quantity: number;
  condition: string;
  expansion: string;
  collectorNumber?: string;
  language?: string;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({
  id,
  name,
  image_url,
  price,
  quantity,
  condition,
  expansion,
  collectorNumber,
  language,
  onUpdateQuantity,
  onRemove
}: CartItemProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };
  
  const incrementQuantity = () => {
    onUpdateQuantity(id, quantity + 1);
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      onUpdateQuantity(id, quantity - 1);
    }
  };
  
  const handleRemove = () => {
    onRemove(id);
  };

  const getLanguageLabel = (code?: string) => {
    if (!code) return '';
    
    const languages: Record<string, string> = {
      en: 'Anglais',
      fr: 'Français',
      de: 'Allemand',
      es: 'Espagnol',
      it: 'Italien',
      pt: 'Portugais',
      jp: 'Japonais',
      ko: 'Coréen',
      cn: 'Chinois',
      ru: 'Russe'
    };
    return languages[code] || code.toUpperCase();
  };

  return (
    <div className="flex border-b border-slate-200 dark:border-slate-700 py-4 animate-fade-up">
      <div className="w-20 h-28 rounded-md overflow-hidden mr-4 flex-shrink-0">
        {!imageLoaded && image_url && (
          <div className="w-full h-full bg-slate-200 dark:bg-slate-700 skeleton-loading" />
        )}
        
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={handleImageLoad}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400 text-center">{name}</span>
          </div>
        )}
      </div>
      
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-base mb-1">
              {name}
              {collectorNumber && (
                <span className="ml-2 text-sm text-slate-500">
                  <Hash className="h-3 w-3 inline mr-1" />
                  {collectorNumber}
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">{expansion}</p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">État: {condition}</p>
              {language && (
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                  <Languages className="h-3 w-3 mr-1" />
                  {getLanguageLabel(language)}
                </p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <p className="font-medium">{formatPrice(price)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Total: {formatPrice(price * quantity)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={decrementQuantity}
              disabled={quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="mx-3 min-w-[2rem] text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={incrementQuantity}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={handleRemove}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Supprimer
          </Button>
        </div>
      </div>
    </div>
  );
}
