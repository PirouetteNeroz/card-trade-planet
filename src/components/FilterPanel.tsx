
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Filter, 
  Sparkles, 
  ArrowUpDown,
  ChevronDown
} from "lucide-react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";

export interface FilterState {
  cardType: string;
  rarity: string;
  condition: string;
  expansion: string;
  priceRange: [number, number];
  language: string;
  isReverse: boolean;
}

export type SortOption = "" | "name-asc" | "name-desc" | "number-asc" | "number-desc";

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
  expansions: Record<string, string>;
  onSortChange: (sort: SortOption) => void;
  currentFilters?: FilterState;
  sortOption?: SortOption;
}

export default function FilterPanel({
  onFilterChange,
  expansions,
  onSortChange,
  currentFilters,
  sortOption = ""
}: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    cardType: "",
    rarity: "",
    condition: "",
    expansion: "",
    priceRange: [0, 1000],
    language: "",
    isReverse: false
  });
  
  const [openSections, setOpenSections] = useState({
    cardType: true,
    rarity: true,
    condition: true,
    expansion: true,
    price: true,
    language: true
  });

  // Update filters if passed in from parent
  useEffect(() => {
    if (currentFilters) {
      setFilters(currentFilters);
    }
  }, [currentFilters]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (value: number[]) => {
    const newFilters = { ...filters, priceRange: [value[0], value[1]] as [number, number] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleSection = (section: string) => {
    setOpenSections({
      ...openSections,
      [section]: !openSections[section as keyof typeof openSections]
    });
  };

  // Card type options
  const cardTypes = [
    { value: "all", label: "Tous" },
    { value: "Pokémon", label: "Pokémon" },
    { value: "Énergie", label: "Énergie" },
    { value: "Dresseur", label: "Dresseur" }
  ];

  // Rarity options
  const rarities = [
    { value: "all", label: "Toutes" },
    { value: "Common", label: "Commune" },
    { value: "Uncommon", label: "Peu commune" },
    { value: "Rare", label: "Rare" },
    { value: "Ultra Rare", label: "Ultra Rare" },
    { value: "Secret Rare", label: "Secrète" }
  ];

  // Condition options
  const conditions = [
    { value: "all", label: "Tous" },
    { value: "Mint", label: "Mint" },
    { value: "Near Mint", label: "Near Mint" },
    { value: "Excellent", label: "Excellent" },
    { value: "Good", label: "Good" },
    { value: "Light Played", label: "Light Played" },
    { value: "Played", label: "Played" },
    { value: "Poor", label: "Poor" }
  ];

  // Language options
  const languages = [
    { value: "all", label: "Toutes" },
    { value: "en", label: "Anglais" },
    { value: "fr", label: "Français" },
    { value: "jp", label: "Japonais" }
  ];

  // Sort options
  const sortOptions = [
    { value: "", label: "Trier par..." },
    { value: "name-asc", label: "Nom (A-Z)" },
    { value: "name-desc", label: "Nom (Z-A)" },
    { value: "number-asc", label: "Numéro ↑" },
    { value: "number-desc", label: "Numéro ↓" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-primary" />
        <h2 className="font-semibold text-lg">Filtres</h2>
      </div>

      {/* Sort Section */}
      <div className="mb-6">
        <Select value={sortOption} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Trier par..." />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value || "default"} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Card Type Section */}
      <Collapsible open={openSections.cardType} onOpenChange={() => toggleSection("cardType")}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer py-1 border-b dark:border-slate-700">
            <Label className="font-medium">Type de carte</Label>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.cardType ? "transform rotate-180" : ""}`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-1">
          <Select 
            value={filters.cardType || "all"} 
            onValueChange={(value) => handleFilterChange("cardType", value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent>
              {cardTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CollapsibleContent>
      </Collapsible>

      {/* Rarity Section */}
      <Collapsible open={openSections.rarity} onOpenChange={() => toggleSection("rarity")}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer py-1 border-b dark:border-slate-700">
            <Label className="font-medium">Rareté</Label>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.rarity ? "transform rotate-180" : ""}`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-1">
          <Select 
            value={filters.rarity || "all"} 
            onValueChange={(value) => handleFilterChange("rarity", value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Toutes les raretés" />
            </SelectTrigger>
            <SelectContent>
              {rarities.map(rarity => (
                <SelectItem key={rarity.value} value={rarity.value}>{rarity.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CollapsibleContent>
      </Collapsible>

      {/* Condition Section */}
      <Collapsible open={openSections.condition} onOpenChange={() => toggleSection("condition")}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer py-1 border-b dark:border-slate-700">
            <Label className="font-medium">État</Label>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.condition ? "transform rotate-180" : ""}`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-1">
          <Select 
            value={filters.condition || "all"} 
            onValueChange={(value) => handleFilterChange("condition", value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tous les états" />
            </SelectTrigger>
            <SelectContent>
              {conditions.map(condition => (
                <SelectItem key={condition.value} value={condition.value}>{condition.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CollapsibleContent>
      </Collapsible>

      {/* Language Section */}
      <Collapsible open={openSections.language} onOpenChange={() => toggleSection("language")}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer py-1 border-b dark:border-slate-700">
            <Label className="font-medium">Langue</Label>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.language ? "transform rotate-180" : ""}`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-1">
          <Select 
            value={filters.language || "all"} 
            onValueChange={(value) => handleFilterChange("language", value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Toutes les langues" />
            </SelectTrigger>
            <SelectContent>
              {languages.map(language => (
                <SelectItem key={language.value} value={language.value}>{language.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CollapsibleContent>
      </Collapsible>

      {/* Expansion Section */}
      <Collapsible open={openSections.expansion} onOpenChange={() => toggleSection("expansion")}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer py-1 border-b dark:border-slate-700">
            <Label className="font-medium">Série</Label>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.expansion ? "transform rotate-180" : ""}`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pb-1">
          <Select 
            value={filters.expansion} 
            onValueChange={(value) => handleFilterChange("expansion", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Toutes les séries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Toutes les séries</SelectItem>
              {Object.entries(expansions).map(([id, name]) => (
                <SelectItem key={id} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CollapsibleContent>
      </Collapsible>

      {/* Price Range Section */}
      <Collapsible open={openSections.price} onOpenChange={() => toggleSection("price")}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer py-1 border-b dark:border-slate-700">
            <Label className="font-medium">Prix</Label>
            <ChevronDown className={`h-4 w-4 transition-transform ${openSections.price ? "transform rotate-180" : ""}`} />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 pb-1">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {filters.priceRange[0]}€
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {filters.priceRange[1]}€
              </span>
            </div>
            <Slider
              defaultValue={[0, 1000]}
              value={[filters.priceRange[0], filters.priceRange[1]]}
              onValueChange={handlePriceChange}
              max={1000}
              step={10}
              className="my-6"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Reverse Holo Switch */}
      <div className="flex items-center space-x-2 mt-2">
        <Switch
          id="reverse"
          checked={filters.isReverse}
          onCheckedChange={(checked) => handleFilterChange("isReverse", checked)}
        />
        <Label htmlFor="reverse" className="flex items-center gap-1 cursor-pointer">
          <Sparkles className="h-4 w-4 text-purple-500" />
          Reverse Holo
        </Label>
      </div>
    </div>
  );
}
