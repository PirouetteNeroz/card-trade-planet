
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card as CardType } from "@/lib/api";

interface PokemonCardProps extends Omit<CardType, 'expansion'> {
  expansion: string;
  addToCart: (card: CardType) => void;
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
  blueprint_id,
  addToCart
}: PokemonCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleAddToCart = () => {
    addToCart({
      id,
      name_en,
      name_fr,
      price,
      image_url,
      condition,
      expansion,
      expansion_id: expansion,
      rarity,
      blueprint_id
    });
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md group">
      <div className="relative aspect-[2/3] bg-slate-200 dark:bg-slate-700 overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse" />
        )}
        
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
            <span className="text-slate-500 dark:text-slate-400">
              {name_fr || name_en}
            </span>
          </div>
        ) : (
          <img
            src={image_url}
            alt={name_fr || name_en}
            className={cn(
              "w-full h-full object-contain transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        
        <div className="absolute top-2 right-2">
          {rarity && (
            <Badge className="mb-1 bg-amber-500 text-white">{rarity}</Badge>
          )}
        </div>
      </div>
      
      <CardContent className="p-3">
        <div className="mb-2">
          <h3 className="font-medium line-clamp-1 text-base">
            {name_fr || name_en}
          </h3>
          {name_fr && name_en && name_fr !== name_en && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              ({name_en})
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Badge variant="outline" className="text-xs">
              {condition}
            </Badge>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {expansion}
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-bold mb-1">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
              }).format(price)}
            </div>
            <Button size="sm" onClick={handleAddToCart}>
              Ajouter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
