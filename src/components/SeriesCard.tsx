
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { safeDisplayValue } from "@/lib/debugUtils";

interface SeriesCardProps {
  serie: {
    id: string;
    name: string;
    logo: string;
    releaseDate?: string;
    cardCount?: any;
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

  // Process cardCount which might be an object
  let cardCountDisplay: string | number | undefined = undefined;
  
  if (serie.cardCount) {
    if (typeof serie.cardCount === 'object') {
      const total = serie.cardCount.total || 0;
      const official = serie.cardCount.official || 0;
      cardCountDisplay = `${official} cartes`;
    } else {
      cardCountDisplay = serie.cardCount;
    }
  }

  return (
    <div 
      onClick={handleClick}
      className="group relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 shadow-md hover:shadow-xl transition-all duration-500 ease-out transform hover:-translate-y-1 cursor-pointer"
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 skeleton-loading" />
        )}
        
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-700">
            <span className="text-slate-500 dark:text-slate-400">{serie.name}</span>
          </div>
        ) : (
          <img
            src={`${serie.logo}.png`}
            alt={serie.name}
            className={cn(
              "w-full h-full object-contain transition-all duration-500",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-lg mb-1 line-clamp-1">{serie.name}</h3>
        <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400">
          {serie.releaseDate && <span>{new Date(serie.releaseDate).getFullYear()}</span>}
          {cardCountDisplay && <span>{cardCountDisplay}</span>}
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-1 bg-pokemon-red scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </div>
  );
}
