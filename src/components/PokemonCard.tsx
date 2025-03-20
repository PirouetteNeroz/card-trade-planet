
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ShoppingCart, Heart, Info, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface PokemonCardProps {
  id: string;
  name_en: string;
  name_fr?: string;
  price: number;
  image_url?: string;
  condition: string;
  expansion: string;
  rarity?: string;
  addToCart: (card: any) => void;
}

export default function PokemonCard({
  id,
  name_en,
  name_fr,
  price,
  image_url,
  condition,
  expansion,
  rarity,
  addToCart
}: PokemonCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleAddToCart = () => {
    addToCart({
      id,
      name_en,
      name_fr,
      price,
      image_url,
      condition,
      expansion
    });

    toast({
      title: "Carte ajoutée au panier",
      description: `${name_fr || name_en} a été ajouté à votre panier.`,
      duration: 3000,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const getConditionColor = (condition: string) => {
    switch(condition.toLowerCase()) {
      case 'mint':
      case 'near mint':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case 'excellent':
      case 'good':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case 'played':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case 'poor':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  return (
    <div className="group relative h-full flex flex-col rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-md hover:shadow-xl transition-all duration-300">
      <div 
        className="relative aspect-[2/3] overflow-hidden cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 skeleton-loading" />
        )}
        
        {image_url ? (
          <img
            src={image_url}
            alt={name_fr || name_en}
            className={cn(
              "w-full h-full object-cover transition-all duration-700",
              imageLoaded ? "scale-100" : "scale-105 blur-sm",
              "group-hover:scale-110 transition-transform duration-700"
            )}
            onLoad={handleImageLoad}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700">
            <span className="text-slate-500 dark:text-slate-400">{name_fr || name_en}</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
        
        {rarity && (
          <Badge className="absolute top-2 right-2 bg-white/80 text-black dark:bg-black/80 dark:text-white backdrop-blur-sm">
            {rarity}
          </Badge>
        )}
      </div>
      
      <div 
        className={cn(
          "absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-4 flex flex-col transition-all duration-500 ease-in-out z-10",
          showDetails ? "opacity-100 visible" : "opacity-0 invisible"
        )}
      >
        <button 
          className="absolute top-2 right-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          onClick={() => setShowDetails(false)}
        >
          <X className="h-5 w-5" />
        </button>
        
        <h3 className="font-medium text-lg mb-3">{name_fr || name_en}</h3>
        
        <div className="space-y-2 text-sm flex-grow">
          {name_fr && name_en && name_fr !== name_en && (
            <p className="text-slate-500 dark:text-slate-400">({name_en})</p>
          )}
          <p>
            <span className="font-medium">Expansion:</span> {expansion}
          </p>
          <p>
            <span className="font-medium">Condition:</span> {condition}
          </p>
          {rarity && (
            <p>
              <span className="font-medium">Rareté:</span> {rarity}
            </p>
          )}
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="font-bold text-lg">{formatPrice(price)}</span>
          <Button size="sm" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-medium text-base line-clamp-2">{name_fr || name_en}</h3>
          <Badge variant="outline" className={cn("ml-2 text-xs whitespace-nowrap", getConditionColor(condition))}>
            {condition}
          </Badge>
        </div>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{expansion}</p>
        
        <div className="mt-auto flex justify-between items-center">
          <span className="font-bold">{formatPrice(price)}</span>
          <div className="flex space-x-1">
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setShowDetails(true)}>
              <Info className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Heart className="h-4 w-4" />
            </Button>
            <Button size="icon" className="h-8 w-8" onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// X icon for the close button
function X(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
