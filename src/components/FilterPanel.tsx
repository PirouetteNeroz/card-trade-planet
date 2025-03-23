
import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
  expansions: Record<string, string>;
  onSortChange?: (sort: SortOption) => void;
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

export type SortOption = 
  | "name-asc" 
  | "name-desc" 
  | "number-asc" 
  | "number-desc" 
  | "";

export default function FilterPanel({ onFilterChange, expansions, onSortChange }: FilterPanelProps) {
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
  const languages = ["", "en", "fr", "jp"];
  
  const languageLabels: Record<string, string> = {
    "": "Toutes",
    "en": "Anglais",
    "fr": "Français",
    "jp": "Japonais"
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

  // Create an array of available extension names from the expansions object
  const extensionNames = ["", ...Object.values(expansions)];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
      <div className="p-4 border-b dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
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
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Sorting Options */}
        {onSortChange && (
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Trier par</label>
            <Select 
              onValueChange={(value) => onSortChange(value as SortOption)}
              defaultValue=""
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un tri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Par défaut</SelectItem>
                <SelectItem value="name-asc">Nom (A-Z)</SelectItem>
                <SelectItem value="name-desc">Nom (Z-A)</SelectItem>
                <SelectItem value="number-asc">Numéro de collection ↑</SelectItem>
                <SelectItem value="number-desc">Numéro de collection ↓</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Card Type Filter */}
        <Collapsible className="w-full">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Type de carte</label>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-2">
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
          </CollapsibleContent>
        </Collapsible>

        {/* Rarity Filter */}
        <Collapsible className="w-full">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Rareté</label>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-2">
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
          </CollapsibleContent>
        </Collapsible>

        {/* Condition Filter */}
        <Collapsible className="w-full">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">État</label>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-2">
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
          </CollapsibleContent>
        </Collapsible>

        {/* Language Filter */}
        <Collapsible className="w-full">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Langue</label>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-2">
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
          </CollapsibleContent>
        </Collapsible>

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
          <Select 
            onValueChange={(value) => handleFilterChange("expansion", value)}
            value={filters.expansion}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Toutes les extensions" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              <SelectItem value="">Toutes</SelectItem>
              {Object.values(expansions).map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
  );
}
