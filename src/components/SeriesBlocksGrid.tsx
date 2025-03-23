
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import SeriesCard from './SeriesCard';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import seriesBlocksData from '@/data/seriesBlocks.json';

interface SeriesBlocksGridProps {
  series: any[];
}

const SeriesBlocksGrid: React.FC<SeriesBlocksGridProps> = ({ series }) => {
  // Organiser les séries par bloc en utilisant le fichier JSON
  const seriesByBlock = useMemo(() => {
    const blocks: Record<string, any[]> = {};
    
    // Initialiser les blocs depuis le fichier JSON
    seriesBlocksData.blocks.forEach(block => {
      blocks[block.name] = [];
    });
    
    // Fonction pour trouver le nom du bloc d'une série
    const getBlockName = (seriesName: string): string => {
      // Chercher dans le mapping de seriesBlocks.json
      for (const block of seriesBlocksData.blocks) {
        const matchingSeries = block.series.find((s: any) => 
          seriesName.includes(s.name) || s.name.includes(seriesName)
        );
        if (matchingSeries) {
          return block.name;
        }
      }
      
      // Si aucune correspondance n'est trouvée, utiliser "Autres"
      return "Autres";
    };
    
    // Assigner chaque série à son bloc
    series.forEach(serie => {
      const blockName = getBlockName(serie.name);
      if (!blocks[blockName]) {
        blocks[blockName] = [];
      }
      blocks[blockName].push(serie);
    });
    
    // Trier les séries dans chaque bloc par date ou par ordre alphabétique
    Object.keys(blocks).forEach(block => {
      blocks[block].sort((a, b) => {
        if (a.releaseDate && b.releaseDate) {
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        }
        return a.name.localeCompare(b.name);
      });
    });
    
    return blocks;
  }, [series]);

  // Obtenir les blocs dans l'ordre défini dans le fichier JSON
  const blockOrder = useMemo(() => {
    return seriesBlocksData.blocks.map(block => block.name).concat(["Autres"]);
  }, []);

  return (
    <Accordion type="multiple" defaultValue={['Écarlate et Violet']} className="space-y-4">
      {blockOrder
        .filter(block => seriesByBlock[block] && seriesByBlock[block].length > 0)
        .map(block => (
          <AccordionItem 
            key={block} 
            value={block}
            className="border border-border rounded-lg overflow-hidden shadow-sm"
          >
            <AccordionTrigger className="px-4 py-3 bg-muted/30 hover:bg-muted/50 font-medium text-lg">
              {block}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                {seriesByBlock[block].length} séries
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {seriesByBlock[block].map(serie => (
                  <ErrorBoundary key={serie.id}>
                    <SeriesCard serie={serie} />
                  </ErrorBoundary>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
    </Accordion>
  );
};

export default SeriesBlocksGrid;
