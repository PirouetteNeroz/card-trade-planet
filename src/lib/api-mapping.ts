
import seriesBlocksData from '@/data/seriesBlocks.json';

/**
 * Trouve l'ID d'une série à partir de son nom
 * @param seriesName - Le nom de la série à rechercher
 * @returns L'ID de la série ou undefined si non trouvé
 */
export function findSeriesIdByName(seriesName: string): string | undefined {
  const mapping = seriesBlocksData.seriesMapping;
  
  // Recherche directe par nom exact
  for (const [id, name] of Object.entries(mapping)) {
    if (name === seriesName) {
      return id;
    }
  }
  
  // Recherche partielle si la recherche exacte échoue
  for (const [id, name] of Object.entries(mapping)) {
    if (name.toLowerCase().includes(seriesName.toLowerCase()) || 
        seriesName.toLowerCase().includes(name.toLowerCase())) {
      return id;
    }
  }
  
  return undefined;
}

/**
 * Trouve le nom d'une série à partir de son ID
 * @param seriesId - L'ID de la série à rechercher
 * @returns Le nom de la série ou undefined si non trouvé
 */
export function findSeriesNameById(seriesId: string): string | undefined {
  return seriesBlocksData.seriesMapping[seriesId];
}
