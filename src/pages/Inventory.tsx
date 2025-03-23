import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PokemonCard from "@/components/PokemonCard";
import FilterPanel, { FilterState, SortOption } from "@/components/FilterPanel";
import { Card, CartItem, fetchInventory, fetchExpansions, saveCartToLocalStorage, loadCartFromLocalStorage } from "@/lib/api";
import { findSeriesNameById } from "@/lib/api-mapping";
import { useToast } from "@/components/ui/use-toast";
import { Grid, List, Loader2, LayoutGrid, Filter, Search, Sparkles, Languages, Hash, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function Inventory() {
  const [inventory, setInventory] = useState<Card[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<Card[]>([]);
  const [expansions, setExpansions] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    cardType: "",
    rarity: "",
    condition: "",
    expansion: "",
    priceRange: [0, 1000],
    language: "",
    isReverse: false
  });
  const [sortOption, setSortOption] = useState<SortOption>("");
  
  const location = useLocation();
  const { toast } = useToast();
  
  const queryParams = new URLSearchParams(location.search);
  const seriesParam = queryParams.get("series");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      const savedCart = loadCartFromLocalStorage();
      setCart(savedCart);
      
      const expansionsData = await fetchExpansions();
      setExpansions(expansionsData);
      
      const inventoryData = await fetchInventory();
      setInventory(inventoryData);
      
      if (seriesParam) {
        const seriesName = findSeriesNameById(seriesParam);
        if (seriesName) {
          setActiveFilters({
            ...activeFilters,
            expansion: seriesName
          });
        }
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [seriesParam]);

  useEffect(() => {
    let filtered = [...inventory];
    
    if (activeFilters.expansion) {
      filtered = filtered.filter(card => card.expansion === activeFilters.expansion);
    }
    
    if (activeFilters.cardType) {
      filtered = filtered.filter(card => {
        if (activeFilters.cardType === "Pokémon") {
          return !card.name_en.includes("Energy") && !card.name_en.includes("Trainer");
        } else if (activeFilters.cardType === "Énergie") {
          return card.name_en.includes("Energy");
        } else if (activeFilters.cardType === "Dresseur") {
          return card.name_en.includes("Trainer");
        }
        return true;
      });
    }
    
    if (activeFilters.rarity) {
      filtered = filtered.filter(card => card.rarity === activeFilters.rarity);
    }
    
    if (activeFilters.condition) {
      filtered = filtered.filter(card => card.condition === activeFilters.condition);
    }
    
    if (activeFilters.language) {
      filtered = filtered.filter(card => card.language === activeFilters.language);
    }
    
    if (activeFilters.isReverse) {
      filtered = filtered.filter(card => card.isReverse);
    }
    
    filtered = filtered.filter(card => 
      card.price >= activeFilters.priceRange[0] && 
      card.price <= activeFilters.priceRange[1]
    );
    
    if (searchQuery) {
      filtered = filtered.filter(card => 
        card.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (card.name_fr && card.name_fr.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (sortOption) {
      filtered.sort((a, b) => {
        switch (sortOption) {
          case "name-asc":
            return (a.name_fr || a.name_en).localeCompare(b.name_fr || b.name_en);
          case "name-desc":
            return (b.name_fr || b.name_en).localeCompare(a.name_fr || a.name_en);
          case "number-asc":
            const numA = parseInt(a.collectorNumber || "0");
            const numB = parseInt(b.collectorNumber || "0");
            return numA - numB;
          case "number-desc":
            const numADesc = parseInt(a.collectorNumber || "0");
            const numBDesc = parseInt(b.collectorNumber || "0");
            return numBDesc - numADesc;
          default:
            return 0;
        }
      });
    }
    
    setFilteredInventory(filtered);
  }, [inventory, activeFilters, searchQuery, sortOption]);

  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortOption(sort);
  };

  const handleAddToCart = (card: Card) => {
    const newCart = [...cart];
    const existingItem = newCart.find(item => item.id === card.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
      
      if (existingItem.quantity > card.quantity) {
        existingItem.quantity = card.quantity;
        toast({
          title: "Quantité maximum atteinte",
          description: `Vous ne pouvez pas ajouter plus de ${card.quantity} exemplaires de cette carte.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Carte ajoutée au panier",
          description: `${card.name_fr || card.name_en} (${existingItem.quantity}x)`,
        });
      }
    } else {
      newCart.push({
        ...card,
        quantity: 1
      });
      
      toast({
        title: "Carte ajoutée au panier",
        description: card.name_fr || card.name_en,
      });
    }
    
    setCart(newCart);
    saveCartToLocalStorage(newCart);
  };
  
  const getActiveFiltersCount = () => {
    let count = 0;
    if (activeFilters.cardType) count++;
    if (activeFilters.rarity) count++;
    if (activeFilters.condition) count++;
    if (activeFilters.expansion) count++;
    if (activeFilters.language) count++;
    if (activeFilters.isReverse) count++;
    if (activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < 1000) count++;
    return count;
  };
  
  const resetAllFilters = () => {
    setActiveFilters({
      cardType: "",
      rarity: "",
      condition: "",
      expansion: "",
      priceRange: [0, 1000],
      language: "",
      isReverse: false
    });
    setSearchQuery("");
    setSortOption("");
  };

  const getLanguageLabel = (code: string) => {
    const languages: Record<string, string> = {
      en: 'Anglais',
      fr: 'Français',
      jp: 'Japonais'
    };
    return languages[code] || code.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 page-transition">
      <Navbar />
      
      <main className="pt-24 pb-16 max-w-7xl mx-auto">
        <div className="px-4 sm:px-6 lg:px-8 mb-8">
          <h1 className="text-3xl font-bold mb-2 text-slate-800 dark:text-slate-100">Inventaire</h1>
          <p className="text-slate-600 dark:text-slate-400">
            {filteredInventory.length} cartes disponibles
          </p>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Rechercher une carte..."
                className="pl-10 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetAllFilters} 
                className="hidden sm:flex items-center gap-2 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Réinitialiser
              </Button>
              
              <div className="hidden sm:flex items-center border rounded-md border-slate-300 dark:border-slate-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "rounded-none border-r", 
                    viewMode === "grid" ? "bg-slate-100 dark:bg-slate-800" : ""
                  )}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    viewMode === "list" ? "bg-slate-100 dark:bg-slate-800" : ""
                  )}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {getActiveFiltersCount() > 0 && (
            <div className="flex items-center mt-4 flex-wrap gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">Filtres actifs:</span>
              {activeFilters.cardType && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                  Type: {activeFilters.cardType}
                </Badge>
              )}
              {activeFilters.rarity && (
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
                  Rareté: {activeFilters.rarity}
                </Badge>
              )}
              {activeFilters.condition && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                  État: {activeFilters.condition}
                </Badge>
              )}
              {activeFilters.language && (
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200">
                  Langue: {getLanguageLabel(activeFilters.language)}
                </Badge>
              )}
              {activeFilters.isReverse && (
                <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-200">
                  Reverse
                </Badge>
              )}
              {activeFilters.expansion && (
                <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200">
                  Extension: {activeFilters.expansion}
                </Badge>
              )}
              {(activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < 1000) && (
                <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200">
                  Prix: {activeFilters.priceRange[0]}€ - {activeFilters.priceRange[1]}€
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={resetAllFilters} className="text-xs h-7 text-slate-600 dark:text-slate-300">
                Réinitialiser
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row">
          <div className="w-full sm:w-72 px-4 sm:px-0 sm:pl-6 flex-shrink-0">
            <div className="sticky top-24 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <FilterPanel 
                onFilterChange={handleFilterChange} 
                expansions={expansions} 
                onSortChange={handleSortChange}
                currentFilters={activeFilters}
                sortOption={sortOption}
              />
            </div>
          </div>
          
          <div className="flex-grow px-4 sm:px-6 mt-6 sm:mt-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">Chargement de l'inventaire...</p>
                </div>
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-medium mb-2 text-slate-800 dark:text-slate-200">Aucune carte trouvée</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Essayez de modifier vos filtres ou votre recherche.
                  </p>
                  <Button onClick={resetAllFilters} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                    Réinitialiser les filtres
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                    {filteredInventory.map((card) => (
                      <div key={card.id} className="transform transition-all duration-300 hover:scale-[1.02]">
                        <PokemonCard
                          id={card.id}
                          name_en={card.name_en}
                          name_fr={card.name_fr}
                          price={card.price}
                          image_url={card.image_url}
                          condition={card.condition}
                          expansion={card.expansion}
                          expansion_id={card.expansion_id}
                          rarity={card.rarity}
                          blueprint_id={card.blueprint_id}
                          quantity={card.quantity}
                          collectorNumber={card.collectorNumber}
                          language={card.language}
                          isReverse={card.isReverse}
                          addToCart={handleAddToCart}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
                    {filteredInventory.map((card, index) => (
                      <div key={card.id}>
                        <div className="flex p-4 animate-fade-in hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                          <div className="w-20 h-28 flex-shrink-0 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden mr-4 relative">
                            {card.image_url ? (
                              <img
                                src={card.image_url}
                                alt={card.name_fr || card.name_en}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-center p-2">
                                {card.name_fr || card.name_en}
                              </div>
                            )}
                            {card.isReverse && (
                              <Badge className="absolute top-1 right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-1">
                                <Sparkles className="h-2 w-2" />
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex-grow">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="font-medium line-clamp-1 text-slate-800 dark:text-slate-200">
                                  {card.name_fr || card.name_en}
                                  {card.collectorNumber && (
                                    <span className="ml-2 text-sm text-slate-500">
                                      <Hash className="h-3 w-3 inline mr-1" />
                                      {card.collectorNumber}
                                    </span>
                                  )}
                                </h3>
                                {card.name_fr && card.name_en && card.name_fr !== card.name_en && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                    ({card.name_en})
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300">
                                    {card.expansion}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs border-green-300 text-green-700 dark:border-green-700 dark:text-green-300">
                                    {card.condition}
                                  </Badge>
                                  
                                  {card.rarity && (
                                    <Badge variant="outline" className="text-xs border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300">
                                      {card.rarity}
                                    </Badge>
                                  )}
                                  
                                  <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300">
                                    <Languages className="h-3 w-3 mr-1" />
                                    {getLanguageLabel(card.language)}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="font-bold text-slate-800 dark:text-slate-100">
                                  {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                  }).format(card.price)}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                  Stock: {card.quantity}
                                </div>
                                <Button 
                                  size="sm" 
                                  className="mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                                  onClick={() => handleAddToCart(card)}
                                >
                                  Ajouter au panier
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < filteredInventory.length - 1 && <Separator className="dark:bg-slate-700" />}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Card Planet. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
