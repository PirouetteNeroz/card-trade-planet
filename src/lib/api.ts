
// API configuration
const API_PRODUCTS = 'https://api.cardtrader.com/api/v2/products/export';
const API_EXPANSIONS = 'https://api.cardtrader.com/api/v2/expansions/export';
const API_TOKEN = 'eyJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJjYXJkdHJhZGVyLXByb2R1Y3Rpb24iLCJzdWIiOiJhcHA6MTM5MzgiLCJhdWQiOiJhcHA6MTM5MzgiLCJleHAiOjQ4OTU2MzQ3MTcsImp0aSI6IjQxMjA3NmNjLTcyZTEtNDljOC1iODA2LTE3OTJiNmU3N2JhMyIsImlhdCI6MTczOTk2MTExNywibmFtZSI6Ik5lcm96YnJpY2tzIEFwcCAyMDI1MDIwODE3NDkxOSJ9.PkkEXit3MvxmVij_e5Eyz55k_3EYgQF-2ln9goSfMbQD3mIpDVrSkQa010BfnF9IR1L8fvswAyxk56qiUr2LKm2KXX0iKAvVRR373A3XEDwgNtGGBBAR-rxh8raL1hW8e4AH_bps1tVFTrdZ_W-Odg5egSxLFIxnLgi0a9It5KVeVkjdgLmxYuaCXspgml9TXfgJcJ2GH62izvB5eUsAj4NhobpH5q_Pyfbyw2cJu4HmilQjBSOm4NsmRW7Nd692tNT2semj1Oh1UqV1xel2WewtLaWlUAVHYt2LSMWrEw_kx9Yjk9Kz-rM67tk0nXosKklnIigJpcrmRUXf-O7qJA';
const IMAGE_BASE_URL = 'https://www.cardtrader.com/images/blueprint/';

// Type definitions
export interface Series {
  id: string;
  name: string;
  logo: string;
  releaseDate?: string;
  cardCount?: number;
}

export interface Card {
  id: string;
  name_en: string;
  name_fr?: string;
  price: number;
  image_url?: string;
  condition: string;
  expansion: string;
  expansion_id: string;
  rarity?: string;
  properties_hash?: any;
  blueprint_id?: number;
  quantity: number;
  collectorNumber?: string;
  language: string;
  isReverse: boolean;
}

export interface CartItem extends Card {
  quantity: number;
}

export interface Order {
  username: string;
  items: CartItem[];
  totalPrice: number;
  orderId: string;
  createdAt: Date;
}

// Cache pour les noms français des séries
let frenchSeriesNames: Record<string, string> = {};

// Fetch all Pokémon card series
export async function fetchAllSeries(): Promise<Series[]> {
  try {
    const response = await fetch('https://api.tcgdex.net/v2/fr/sets');
    if (!response.ok) throw new Error('Impossible de récupérer les séries');
    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    return [];
  }
}

// Fetch French series names from tcgdex
export async function fetchFrenchSeriesNames(): Promise<Record<string, string>> {
  if (Object.keys(frenchSeriesNames).length > 0) {
    return frenchSeriesNames;
  }
  
  try {
    const response = await fetch('https://api.tcgdex.net/v2/fr/sets');
    if (!response.ok) throw new Error('Impossible de récupérer les séries françaises');
    
    const seriesData = await response.json();
    const mapping: Record<string, string> = {};
    
    // Créer un mapping entre noms anglais et français
    seriesData.forEach((series: any) => {
      // Stocker l'ID avec le nom français
      mapping[series.id.toLowerCase()] = series.name;
      
      // Aussi mapper le nom anglais vers le nom français si disponible
      if (series.name) {
        const simplifiedName = series.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        mapping[simplifiedName] = series.name;
      }
    });
    
    console.log("Mapping des noms français chargé:", mapping);
    frenchSeriesNames = mapping;
    return mapping;
  } catch (error) {
    console.error("Erreur lors de la récupération des noms français:", error);
    return {};
  }
}

// Traduire un nom de série en français
export async function getSeriesFrenchName(englishName: string): Promise<string> {
  // Si l'entrée ressemble à un ID (format court comme sv01, swsh01)
  if (/^[a-z0-9-]{2,8}$/i.test(englishName)) {
    try {
      // Essayer de récupérer directement depuis l'API
      const response = await fetch(`https://api.tcgdex.net/v2/fr/sets/${englishName}`);
      if (response.ok) {
        const data = await response.json();
        if (data.name) {
          console.log(`Traduction directe pour ${englishName}: ${data.name}`);
          return data.name;
        }
      }
    } catch (e) {
      console.error("Erreur lors de la récupération directe:", e);
    }
  }
  
  // Fallback sur le mapping en cache
  const frenchNames = await fetchFrenchSeriesNames();
  
  // Nettoyer le nom pour la correspondance
  const cleanName = englishName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  
  // Recherche directe par l'ID
  if (frenchNames[englishName.toLowerCase()]) {
    console.log(`Traduction par ID pour ${englishName}: ${frenchNames[englishName.toLowerCase()]}`);
    return frenchNames[englishName.toLowerCase()];
  }
  
  // Recherche par nom nettoyé
  if (frenchNames[cleanName]) {
    console.log(`Traduction par nom nettoyé pour ${englishName}: ${frenchNames[cleanName]}`);
    return frenchNames[cleanName];
  }
  
  // Recherche par correspondance partielle si les autres méthodes échouent
  for (const [key, value] of Object.entries(frenchNames)) {
    if (key.includes(cleanName) || cleanName.includes(key)) {
      console.log(`Traduction par correspondance partielle pour ${englishName}: ${value}`);
      return value;
    }
  }
  
  console.log(`Aucune traduction trouvée pour ${englishName}, retour du nom original`);
  return englishName; // Retourner le nom original si aucune traduction trouvée
}

// Fetch expansions from CardTrader API
export async function fetchExpansions(): Promise<Record<string, string>> {
  try {
    const response = await fetch(API_EXPANSIONS, {
      method: "GET",
      headers: { "Authorization": `Bearer ${API_TOKEN}` }
    });
    
    if (!response.ok) throw new Error(`Erreur API Expansions: ${response.status}`);
    
    const data = await response.json();
    const expansionMap: Record<string, string> = {};
    
    // Précharger les noms français
    await fetchFrenchSeriesNames();
    
    for (const exp of data) {
      try {
        // Essayer de trouver la traduction française
        const frenchName = await getSeriesFrenchName(exp.id);
        expansionMap[exp.id] = frenchName || exp.name;
        console.log(`Expansion mappée: ${exp.id} -> ${expansionMap[exp.id]}`);
      } catch (e) {
        console.error(`Erreur lors de la traduction de ${exp.id}:`, e);
        expansionMap[exp.id] = exp.name;
      }
    }
    
    return expansionMap;
  } catch (error) {
    console.error("Erreur lors du chargement des extensions:", error);
    return {};
  }
}

// Fetch inventory from CardTrader API
export async function fetchInventory(): Promise<Card[]> {
  try {
    const response = await fetch(API_PRODUCTS, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    });
    
    if (!response.ok) throw new Error(`Erreur API Produits: ${response.status}`);
    
    const data = await response.json();
    
    // Fetch expansions map first
    const expansionsMap = await fetchExpansions();
    
    // Charger les informations des séries pour obtenir les comptes de cartes
    let seriesInfo: Record<string, any> = {};
    try {
      const tcgdexResponse = await fetch('https://api.tcgdex.net/v2/fr/sets');
      if (tcgdexResponse.ok) {
        const seriesData = await tcgdexResponse.json();
        seriesData.forEach((series: any) => {
          seriesInfo[series.id.toLowerCase()] = {
            cardCount: series.cardCount?.total || 0,
            releaseDate: series.releaseDate
          };
        });
      }
    } catch (e) {
      console.error("Erreur lors du chargement des informations de série:", e);
    }
    
    return await Promise.all(data.map(async (card: any) => {
      const frenchName = await fetchFrenchPokemonName(card.name_en.toLowerCase());
      
      // Utiliser le nom français de l'extension s'il est disponible
      let expansionName = expansionsMap[card.expansion.id] || card.expansion.id;
      
      return {
        id: card.id,
        name_en: card.name_en,
        name_fr: frenchName,
        price: card.price_cents / 100, // Convert cents to euros
        image_url: card.blueprint_id ? `${IMAGE_BASE_URL}${card.blueprint_id}.jpg` : undefined,
        condition: card.properties_hash?.condition || 'Non spécifiée',
        expansion: expansionName,
        expansion_id: card.expansion.id,
        rarity: card.properties_hash?.pokemon_rarity,
        properties_hash: card.properties_hash,
        blueprint_id: card.blueprint_id,
        quantity: card.quantity || 1,
        collectorNumber: card.properties_hash?.collector_number,
        language: card.properties_hash?.pokemon_language || 'en',
        isReverse: card.properties_hash?.pokemon_reverse || false
      };
    }));
  } catch (error) {
    console.error("Erreur API:", error);
    return [];
  }
}

// Fetch French Pokémon name
export async function fetchFrenchPokemonName(nameEn: string): Promise<string> {
  try {
    // Remove any special characters and extract just the Pokémon name
    const simplifiedName = nameEn.replace(/[^a-zA-Z0-9]/g, ' ')
                                 .split(' ')
                                 .filter(Boolean)[0]
                                 .toLowerCase();
    
    if (!simplifiedName) return nameEn;
    
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${simplifiedName}`);
    if (!response.ok) return nameEn;
    
    const data = await response.json();
    
    // Find the French name in the names array
    const frenchNameObj = data.names.find((name: any) => name.language.name === 'fr');
    return frenchNameObj ? frenchNameObj.name : nameEn;
  } catch (error) {
    console.error("Erreur lors de la traduction:", error);
    return nameEn;
  }
}

// Save cart to local storage
export function saveCartToLocalStorage(cart: CartItem[]): void {
  localStorage.setItem('pokemon-cart', JSON.stringify(cart));
}

// Load cart from local storage
export function loadCartFromLocalStorage(): CartItem[] {
  const savedCart = localStorage.getItem('pokemon-cart');
  return savedCart ? JSON.parse(savedCart) : [];
}

// Create an order in Supabase (to be implemented with Supabase)
export async function createOrder(username: string, items: CartItem[], totalPrice: number): Promise<string> {
  // This is a placeholder for when Supabase is connected
  const orderId = `order-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // For now, just save to localStorage for demo purposes
  const order: Order = {
    username,
    items,
    totalPrice,
    orderId,
    createdAt: new Date()
  };
  
  const savedOrders = localStorage.getItem('pokemon-orders');
  const orders = savedOrders ? JSON.parse(savedOrders) : [];
  orders.push(order);
  localStorage.setItem('pokemon-orders', JSON.stringify(orders));
  
  return orderId;
}

// Get all orders (to be implemented with Supabase)
export function getOrders(): Order[] {
  const savedOrders = localStorage.getItem('pokemon-orders');
  return savedOrders ? JSON.parse(savedOrders) : [];
}
