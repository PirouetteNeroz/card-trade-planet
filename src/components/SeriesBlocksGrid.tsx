
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import SeriesCard from "./SeriesCard";
import seriesBlocksData from '@/data/seriesBlocks.json';

interface SeriesGridProps {
  series: any[];
}

export default function SeriesBlocksGrid({ series }: SeriesGridProps) {
  const blocks = seriesBlocksData.blocks;
  
  return (
    <div className="space-y-10">
      {blocks.map((block, index) => (
        <Card key={block.id} className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 p-6">
            <h3 className="text-xl font-bold">{block.name}</h3>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {block.series.map((item) => {
                // Trouver les données supplémentaires de la série dans notre API
                const serieData = series.find(s => 
                  s.id === item.id || s.name === item.name
                );
                
                // Fusionner les données
                const mergedData = {
                  ...item,
                  ...(serieData || {}),
                  logo_url: item.logo_url || (serieData?.logo_url || ""),
                  tcgdex_id: item.id
                };
                
                return (
                  <SeriesCard key={item.id} serie={mergedData} compact />
                );
              })}
            </div>
            
            {index < blocks.length - 1 && (
              <Separator className="mt-6" />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
