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
    
    data.forEach((exp: any) => {
      expansionMap[exp.id] = exp.name;
    });
    
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
    
    return await Promise.all(data.map(async (card: any) => {
      const frenchName = await fetchFrenchPokemonName(card.name_en.toLowerCase());
      
      // Use expansion name from the map or fallback to ID
      const expansionName = expansionsMap[card.expansion.id] || card.expansion.id;
      
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
