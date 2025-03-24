
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { findSeriesIdByName, getSeriesInfo } from "@/lib/api-mapping";

interface SeriesCardProps {
  serie: any;
  compact?: boolean;
}

export default function SeriesCard({ serie, compact = false }: SeriesCardProps) {
  // Get the series ID for linking to inventory
  const seriesId = serie.tcgdex_id || findSeriesIdByName(serie.name);
  const [cardCount, setCardCount] = useState<number | undefined>(undefined);
  
  useEffect(() => {
    const fetchSeriesInfo = async () => {
      if (seriesId) {
        const info = await getSeriesInfo(seriesId);
        if (info.cardCount) {
          setCardCount(info.cardCount);
        }
      }
    };
    
    fetchSeriesInfo();
  }, [seriesId]);
  
  return (
    <Link to={seriesId ? `/inventory?series=${seriesId}` : "/inventory"}>
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="relative">
          <div className="aspect-[2/1] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
            {serie.logo_url ? (
              <img
                src={serie.logo_url}
                alt={serie.name}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-2xl font-bold text-center text-slate-500 dark:text-slate-400">
                {serie.name}
              </div>
            )}
          </div>
        </div>

        <CardContent className={compact ? "p-3" : "p-4"}>
          <h3 className={`font-bold ${compact ? "text-sm" : "text-lg"} mb-1`}>
            {serie.name}
          </h3>
          
          {!compact && (
            <div className="flex flex-wrap gap-2 mt-2">
              {(cardCount || serie.cardCountDisplay) && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {cardCount ? `${cardCount} cartes` : serie.cardCountDisplay}
                </Badge>
              )}
              
              {serie.releaseDate && (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(serie.releaseDate)}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
