
import seriesBlocksData from '@/data/seriesBlocks.json';
import { getSeriesFrenchName } from './api';

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
export async function findSeriesNameById(seriesId: string): Promise<string | undefined> {
  const englishName = seriesBlocksData.seriesMapping[seriesId];
  if (!englishName) return undefined;
  
  try {
    // Tenter de trouver le nom français
    const frenchName = await getSeriesFrenchName(englishName);
    return frenchName || englishName;
  } catch (error) {
    console.error("Erreur lors de la traduction du nom de série:", error);
    return englishName;
  }
}

/**
 * Obtient les informations de série depuis TCGdex
 * @param seriesId - L'ID de la série
 * @returns Informations sur la série incluant le nombre de cartes
 */
export async function getSeriesInfo(seriesId: string): Promise<{cardCount?: number, releaseDate?: string}> {
  try {
    const response = await fetch(`https://api.tcgdex.net/v2/fr/sets/${seriesId}`);
    if (!response.ok) return {};
    
    const data = await response.json();
    return {
      cardCount: data.cardCount?.total || 0,
      releaseDate: data.releaseDate
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération des infos pour ${seriesId}:`, error);
    return {};
  }
}
