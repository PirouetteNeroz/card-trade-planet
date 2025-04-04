
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card as CardType } from "@/lib/api";
import { Sparkles, Plus, Minus, Hash, Languages } from "lucide-react";
import { getSeriesFrenchName } from "@/lib/api";

interface PokemonCardProps extends CardType {
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
  expansion_id,
  rarity,
  blueprint_id,
  quantity,
  collectorNumber,
  language,
  isReverse,
  addToCart
}: PokemonCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(1);
  const [translatedExpansion, setTranslatedExpansion] = useState(expansion);

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
      expansion: translatedExpansion, // Utiliser le nom traduit
      expansion_id,
      rarity,
      blueprint_id,
      quantity,
      collectorNumber,
      language,
      isReverse
    });
  };

  useEffect(() => {
    // Essayer de traduire le nom de l'expansion si nécessaire
    const translateExpansion = async () => {
      if (expansion_id) {
        try {
          const frenchName = await getSeriesFrenchName(expansion_id);
          if (frenchName && frenchName !== expansion) {
            console.log(`Expansion traduite: ${expansion} -> ${frenchName}`);
            setTranslatedExpansion(frenchName);
          }
        } catch (e) {
          console.error("Erreur lors de la traduction de l'expansion:", e);
        }
      }
    };
    
    translateExpansion();
  }, [expansion_id, expansion]);

  const incrementQuantity = () => {
    if (cartQuantity < quantity) {
      setCartQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (cartQuantity > 1) {
      setCartQuantity(prev => prev - 1);
    }
  };

  const getLanguageLabel = (code: string) => {
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
    <Card className={cn(
      "overflow-hidden transition-all duration-300 hover:shadow-lg group h-full",
      isReverse ? "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700" : ""
    )}>
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
        
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {rarity && (
            <Badge className="mb-1 bg-amber-500 text-white">{rarity}</Badge>
          )}
          {isReverse && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              Reverse
            </Badge>
          )}
          {collectorNumber && (
            <Badge variant="outline" className="bg-white/80 dark:bg-slate-800/80">
              <Hash className="h-3 w-3 mr-1" />
              {collectorNumber}
            </Badge>
          )}
        </div>
        
        <div className="absolute bottom-2 left-2">
          <Badge variant="outline" className="bg-slate-800/80 text-white dark:bg-white/80 dark:text-slate-800">
            <Languages className="h-3 w-3 mr-1" />
            {getLanguageLabel(language)}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-medium line-clamp-2 text-base">
            {name_fr || name_en}
          </h3>
          {name_fr && name_en && name_fr !== name_en && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              ({name_en})
            </p>
          )}
          <div className="flex justify-between items-center mt-2">
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium truncate max-w-[70%]">
              {translatedExpansion}
            </div>
            <Badge variant="outline" className="text-xs whitespace-nowrap">
              {condition}
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <div className="font-bold text-lg text-primary">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
              }).format(price)}
            </div>
            <Badge variant="outline" className="text-xs">
              Stock: {quantity}
            </Badge>
          </div>
          
          <div className="flex gap-2 mt-1">
            <div className="flex items-center border rounded flex-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 p-0"
                onClick={decrementQuantity}
                disabled={cartQuantity <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="flex-1 text-center text-sm">{cartQuantity}</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 p-0"
                onClick={incrementQuantity}
                disabled={cartQuantity >= quantity}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleAddToCart}>
              Ajouter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
