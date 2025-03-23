
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Grid, Layers } from "lucide-react";

interface SeriesCardProps {
  serie: {
    id: string;
    name: string;
    logo: string;
    releaseDate?: string;
    cardCount?: any;
    cardCountDisplay?: string;
  };
}

export default function SeriesCard({ serie }: SeriesCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleClick = () => {
    navigate(`/inventory?series=${serie.id}`);
  };

  // Extract card count for display
  let cardCountDisplay: string | number | undefined = undefined;
  
  if (serie.cardCountDisplay) {
    cardCountDisplay = serie.cardCountDisplay;
  } else if (serie.cardCount) {
    if (typeof serie.cardCount === 'object') {
      const total = serie.cardCount.total || 0;
      const official = serie.cardCount.official || 0;
      cardCountDisplay = `${official} cartes`;
    } else {
      cardCountDisplay = serie.cardCount;
    }
  }

  return (
    <Card 
      onClick={handleClick}
      className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-md hover:shadow-xl transition-all duration-500 ease-out transform hover:-translate-y-1 cursor-pointer h-full"
    >
      <div className="aspect-[4/3] relative overflow-hidden p-4 flex items-center justify-center">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 skeleton-loading" />
        )}
        
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-700 p-4 text-center">
            <span className="text-slate-500 dark:text-slate-400 font-medium">{serie.name}</span>
          </div>
        ) : (
          <img
            src={`${serie.logo}.png`}
            alt={serie.name}
            className={cn(
              "max-w-full max-h-32 object-contain transition-all duration-500",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <CardContent className="p-4 relative z-10">
        <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{serie.name}</h3>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {serie.releaseDate && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(serie.releaseDate).getFullYear()}
            </Badge>
          )}
          
          {cardCountDisplay && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {cardCountDisplay}
            </Badge>
          )}
          
          <Badge variant="secondary" className="flex items-center gap-1">
            <Grid className="h-3 w-3" />
            Voir l'inventaire
          </Badge>
        </div>
      </CardContent>
      
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pokemon-red via-amber-500 to-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </Card>
  );
}
