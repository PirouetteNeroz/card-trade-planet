
import { useState } from "react";
import { Filter, ChevronDown, X, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
  expansions: Record<string, string>;
}

export interface FilterState {
  cardType: string;
  rarity: string;
  condition: string;
  expansion: string;
  priceRange: [number, number];
  language: string;
  isReverse: boolean;
}

export default function FilterPanel({ onFilterChange, expansions }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    cardType: "",
    rarity: "",
    condition: "",
    expansion: "",
    priceRange: [0, 1000],
    language: "",
    isReverse: false
  });
  
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const cardTypes = ["", "Pokémon", "Dresseur", "Énergie"];
  const rarities = ["", "Common", "Uncommon", "Rare", "Holo Rare", "Ultra Rare", "Secret Rare"];
  const conditions = ["", "Mint", "Near Mint", "Excellent", "Good", "Played", "Poor"];
  const languages = ["", "en", "fr", "de", "es", "it", "pt", "jp", "ko", "cn", "ru"];
  
  const languageLabels: Record<string, string> = {
    "": "Toutes",
    "en": "Anglais",
    "fr": "Français",
    "de": "Allemand",
    "es": "Espagnol",
    "it": "Italien",
    "pt": "Portugais",
    "jp": "Japonais",
    "ko": "Coréen",
    "cn": "Chinois",
    "ru": "Russe"
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    // Make sure priceRange is always a tuple of [number, number]
    let updatedValue = value;
    if (key === 'priceRange' && Array.isArray(value)) {
      // Ensure it's a tuple with exactly 2 elements
      updatedValue = [
        value[0] !== undefined ? value[0] : filters.priceRange[0],
        value[1] !== undefined ? value[1] : filters.priceRange[1]
      ] as [number, number];
    }
    
    const newFilters = { ...filters, [key]: updatedValue };
    setFilters(newFilters);
    onFilterChange(newFilters);
    
    // Count active filters
    let count = 0;
    if (newFilters.cardType) count++;
    if (newFilters.rarity) count++;
    if (newFilters.condition) count++;
    if (newFilters.expansion) count++;
    if (newFilters.language) count++;
    if (newFilters.isReverse) count++;
    if (newFilters.priceRange[0] > 0 || newFilters.priceRange[1] < 1000) count++;
    setActiveFiltersCount(count);
  };

  const resetFilters = () => {
    const resetState: FilterState = {
      cardType: "",
      rarity: "",
      condition: "",
      expansion: "",
      priceRange: [0, 1000],
      language: "",
      isReverse: false
    };
    setFilters(resetState);
    onFilterChange(resetState);
    setActiveFiltersCount(0);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden transition-all duration-300">
      <div className="p-4 border-b dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Filtres</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="h-3.5 w-3.5 mr-1" />
                Réinitialiser
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isExpanded ? "rotate-180" : ""
                )}
              />
            </Button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded ? "max-h-[800px]" : "max-h-0"
        )}
      >
        <div className="p-4 space-y-4">
          {/* Card Type Filter */}
          <div>
            <label className="text-sm font-medium mb-1 block">Type de carte</label>
            <div className="flex flex-wrap gap-2">
              {cardTypes.map((type) => (
                <Badge
                  key={type}
                  variant={filters.cardType === type ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("cardType", type)}
                >
                  {type || "Tous"}
                </Badge>
              ))}
            </div>
          </div>

          {/* Rarity Filter */}
          <div>
            <label className="text-sm font-medium mb-1 block">Rareté</label>
            <div className="flex flex-wrap gap-2">
              {rarities.map((rarity) => (
                <Badge
                  key={rarity}
                  variant={filters.rarity === rarity ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("rarity", rarity)}
                >
                  {rarity || "Toutes"}
                </Badge>
              ))}
            </div>
          </div>

          {/* Condition Filter */}
          <div>
            <label className="text-sm font-medium mb-1 block">État</label>
            <div className="flex flex-wrap gap-2">
              {conditions.map((condition) => (
                <Badge
                  key={condition}
                  variant={filters.condition === condition ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("condition", condition)}
                >
                  {condition || "Tous"}
                </Badge>
              ))}
            </div>
          </div>

          {/* Language Filter */}
          <div>
            <label className="text-sm font-medium mb-1 block">Langue</label>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <Badge
                  key={lang}
                  variant={filters.language === lang ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleFilterChange("language", lang)}
                >
                  {languageLabels[lang]}
                </Badge>
              ))}
            </div>
          </div>

          {/* Reverse Filter */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="reverse"
              checked={filters.isReverse}
              onCheckedChange={(checked) => handleFilterChange("isReverse", !!checked)}
            />
            <label
              htmlFor="reverse"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Cartes Reverse uniquement
            </label>
          </div>

          {/* Expansion Filter */}
          <div>
            <label className="text-sm font-medium mb-1 block">Extension</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {filters.expansion ? expansions[filters.expansion] : "Toutes les extensions"}
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto">
                <DropdownMenuRadioGroup
                  value={filters.expansion}
                  onValueChange={(value) => handleFilterChange("expansion", value)}
                >
                  <DropdownMenuRadioItem value="">Toutes</DropdownMenuRadioItem>
                  {Object.entries(expansions).map(([id, name]) => (
                    <DropdownMenuRadioItem key={id} value={id}>
                      {name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Price Range Filter */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium">Prix</label>
              <span className="text-sm text-slate-500">
                {filters.priceRange[0]}€ - {filters.priceRange[1]}€
              </span>
            </div>
            <Slider
              defaultValue={[0, 1000]}
              min={0}
              max={1000}
              step={1}
              value={filters.priceRange}
              onValueChange={(value) => handleFilterChange("priceRange", value)}
              className="my-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
