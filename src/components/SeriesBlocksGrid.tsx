
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

// Mapping des générations de Pokémon
const GENERATION_MAPPING = {
  'Base': ['Base', 'Jungle', 'Fossil', 'Base Set 2', 'Team Rocket'],
  'Neo': ['Neo Genesis', 'Neo Discovery', 'Neo Revelation', 'Neo Destiny'],
  'Épée et Bouclier': ['Sword & Shield', 'Rebel Clash', 'Darkness Ablaze', 'Vivid Voltage', 'Battle Styles', 'Chilling Reign', 'Evolving Skies', 'Fusion Strike', 'Brilliant Stars', 'Astral Radiance', 'Lost Origin', 'Silver Tempest', 'Crown Zenith'],
  'Soleil et Lune': ['Sun & Moon', 'Guardians Rising', 'Burning Shadows', 'Crimson Invasion', 'Ultra Prism', 'Forbidden Light', 'Celestial Storm', 'Lost Thunder', 'Team Up', 'Unbroken Bonds', 'Unified Minds', 'Cosmic Eclipse'],
  'XY': ['XY', 'Flashfire', 'Furious Fists', 'Phantom Forces', 'Primal Clash', 'Roaring Skies', 'Ancient Origins', 'BREAKthrough', 'BREAKpoint', 'Fates Collide', 'Steam Siege', 'Evolutions'],
  'Noir et Blanc': ['Black & White', 'Emerging Powers', 'Noble Victories', 'Next Destinies', 'Dark Explorers', 'Dragons Exalted', 'Boundaries Crossed', 'Plasma Storm', 'Plasma Freeze', 'Plasma Blast', 'Legendary Treasures'],
  'Diamant et Perle': ['Diamond & Pearl', 'Mysterious Treasures', 'Secret Wonders', 'Great Encounters', 'Majestic Dawn', 'Legends Awakened', 'Stormfront', 'Platinum', 'Rising Rivals', 'Supreme Victors', 'Arceus'],
  'EX': ['EX Ruby & Sapphire', 'EX Sandstorm', 'EX Dragon', 'EX Team Magma vs Team Aqua', 'EX Hidden Legends', 'EX FireRed & LeafGreen', 'EX Team Rocket Returns', 'EX Deoxys', 'EX Emerald', 'EX Unseen Forces', 'EX Delta Species', 'EX Legend Maker', 'EX Holon Phantoms', 'EX Crystal Guardians', 'EX Dragon Frontiers', 'EX Power Keepers'],
  'Écarlate et Violet': ['Scarlet & Violet', 'Paldea Evolved', 'Obsidian Flames', 'Paradox Rift', 'Temporal Forces'],
  'Spécial': ['Celebrations', 'Shining Fates', 'Hidden Fates', 'Detective Pikachu', 'Shining Legends', 'Dragon Majesty'],
};

// Déterminer le bloc d'une série
const getSeriesBlock = (seriesName: string): string => {
  for (const [block, series] of Object.entries(GENERATION_MAPPING)) {
    if (series.some(s => seriesName.includes(s))) {
      return block;
    }
  }
  
  // Vérifications par mot-clé
  if (seriesName.includes('EX')) return 'EX';
  if (seriesName.includes('GX')) return 'Soleil et Lune';
  if (seriesName.includes('V') || seriesName.includes('VMAX') || seriesName.includes('VSTAR')) return 'Épée et Bouclier';
  if (seriesName.includes('ex')) return 'ex';
  
  return 'Autres';
};

// Tri des séries par date (du plus récent au plus ancien)
const sortSeriesByDate = (a: any, b: any) => {
  if (!a.releaseDate && !b.releaseDate) return 0;
  if (!a.releaseDate) return 1;
  if (!b.releaseDate) return -1;
  return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
};

interface SeriesBlocksGridProps {
  series: any[];
}

const SeriesBlocksGrid: React.FC<SeriesBlocksGridProps> = ({ series }) => {
  // Organiser les séries par bloc
  const seriesByBlock = useMemo(() => {
    const blocks: Record<string, any[]> = {};
    
    series.forEach(serie => {
      const block = getSeriesBlock(serie.name);
      if (!blocks[block]) {
        blocks[block] = [];
      }
      blocks[block].push(serie);
    });
    
    // Trier les séries dans chaque bloc
    Object.keys(blocks).forEach(block => {
      blocks[block].sort(sortSeriesByDate);
    });
    
    return blocks;
  }, [series]);

  // Obtenir les blocs triés par ordre chronologique inversé
  const blockOrder = useMemo(() => {
    const blocksByImportance = [
      'Écarlate et Violet',
      'Épée et Bouclier',
      'Soleil et Lune',
      'XY',
      'Noir et Blanc',
      'Diamant et Perle',
      'EX',
      'Neo',
      'Base',
      'Spécial',
      'Autres'
    ];
    
    return [...new Set([...blocksByImportance, ...Object.keys(seriesByBlock)])];
  }, [seriesByBlock]);

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
