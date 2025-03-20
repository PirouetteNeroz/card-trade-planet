import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PokemonCard from "@/components/PokemonCard";
import FilterPanel, { FilterState } from "@/components/FilterPanel";
import { Card, CartItem, fetchInventory, fetchExpansions, saveCartToLocalStorage, loadCartFromLocalStorage } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Grid, List, Loader2, LayoutGrid, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function Inventory() {
  const [inventory, setInventory] = useState<Card[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<Card[]>([]);
  const [expansions, setExpansions] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    cardType: "",
    rarity: "",
    condition: "",
    expansion: "",
    priceRange: [0, 1000],
  });
  
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
        setActiveFilters({
          ...activeFilters,
          expansion: seriesParam
        });
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...inventory];
    
    if (activeFilters.expansion) {
      filtered = filtered.filter(card => card.expansion_id === activeFilters.expansion);
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
    
    setFilteredInventory(filtered);
  }, [inventory, activeFilters, searchQuery]);

  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
  };

  const handleAddToCart = (card: Card) => {
    const newCart = [...cart];
    const existingItem = newCart.find(item => item.id === card.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      newCart.push({
        ...card,
        quantity: 1
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
    });
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 page-transition">
      <Navbar />
      
      <main className="pt-24 pb-16 max-w-7xl mx-auto">
        <div className="px-4 sm:px-6 lg:px-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">Inventaire</h1>
          <p className="text-slate-500 dark:text-slate-400">
            {filteredInventory.length} cartes disponibles
          </p>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Rechercher une carte..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-1">{getActiveFiltersCount()}</Badge>
                )}
              </Button>
              
              <div className="hidden sm:flex items-center border rounded-md">
                <Button
                  variant={viewMode === "grid" ? "ghost" : "ghost"}
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
                  variant={viewMode === "list" ? "ghost" : "ghost"}
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
                <Badge variant="secondary" className="text-xs">
                  Type: {activeFilters.cardType}
                </Badge>
              )}
              {activeFilters.rarity && (
                <Badge variant="secondary" className="text-xs">
                  Rareté: {activeFilters.rarity}
                </Badge>
              )}
              {activeFilters.condition && (
                <Badge variant="secondary" className="text-xs">
                  État: {activeFilters.condition}
                </Badge>
              )}
              {activeFilters.expansion && expansions[activeFilters.expansion] && (
                <Badge variant="secondary" className="text-xs">
                  Extension: {expansions[activeFilters.expansion]}
                </Badge>
              )}
              {(activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < 1000) && (
                <Badge variant="secondary" className="text-xs">
                  Prix: {activeFilters.priceRange[0]}€ - {activeFilters.priceRange[1]}€
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={resetAllFilters} className="text-xs h-7">
                Réinitialiser
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row">
          <div className={cn(
            "w-full sm:w-64 px-4 sm:px-0 sm:pl-6 flex-shrink-0 transition-all duration-300 overflow-hidden",
            showFilters ? "block" : "hidden sm:block"
          )}>
            <div className="sticky top-24">
              <FilterPanel onFilterChange={handleFilterChange} expansions={expansions} />
            </div>
          </div>
          
          <div className="flex-grow px-4 sm:px-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-medium mb-2">Aucune carte trouvée</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Essayez de modifier vos filtres ou votre recherche.
                  </p>
                  <Button onClick={resetAllFilters}>Réinitialiser les filtres</Button>
                </div>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                    {filteredInventory.map((card) => (
                      <PokemonCard
                        key={card.id}
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
                        addToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
                    {filteredInventory.map((card, index) => (
                      <>
                        <div className="flex p-4 animate-fade-in" key={card.id}>
                          <div className="w-20 h-28 flex-shrink-0 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden mr-4">
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
                          </div>
                          
                          <div className="flex-grow">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="font-medium line-clamp-1">{card.name_fr || card.name_en}</h3>
                                {card.name_fr && card.name_en && card.name_fr !== card.name_en && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                    ({card.name_en})
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">{card.expansion}</Badge>
                                  <Badge variant="outline" className="text-xs">{card.condition}</Badge>
                                  {card.rarity && (
                                    <Badge variant="outline" className="text-xs">{card.rarity}</Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="font-bold">
                                  {new Intl.NumberFormat('fr-FR', {
                                    style: 'currency',
                                    currency: 'EUR'
                                  }).format(card.price)}
                                </div>
                                <Button 
                                  size="sm" 
                                  className="mt-2"
                                  onClick={() => handleAddToCart(card)}
                                >
                                  Ajouter au panier
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < filteredInventory.length - 1 && <Separator />}
                      </>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Card Planet. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
