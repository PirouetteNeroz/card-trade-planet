
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import SeriesCard from "@/components/SeriesCard";
import { Series, fetchAllSeries } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Index() {
  const [series, setSeries] = useState<Series[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const loadSeries = async () => {
      setIsLoading(true);
      const data = await fetchAllSeries();
      setSeries(data);
      setFilteredSeries(data);
      setIsLoading(false);
    };

    loadSeries();
  }, []);

  useEffect(() => {
    // Filter series based on search query and active tab
    let filtered = series;

    if (searchQuery) {
      filtered = filtered.filter((series) =>
        series.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeTab === "recent") {
      filtered = filtered
        .filter((series) => series.releaseDate)
        .sort((a, b) => {
          const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
          const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 12);
    } else if (activeTab === "popular") {
      // For demonstration, we'll just show some randomly selected series as "popular"
      filtered = [...filtered].sort(() => 0.5 - Math.random()).slice(0, 12);
    }

    setFilteredSeries(filtered);
  }, [searchQuery, activeTab, series]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 page-transition">
      <Navbar />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <section className="mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pokemon-blue via-pokemon-red to-pokemon-yellow animate-pulse">
              Card Planet
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
              Découvrez notre collection de cartes Pokémon exceptionnelles
            </p>
            
            <div className="relative max-w-md mx-auto mb-12">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Rechercher une série..."
                className="pl-10 py-6 rounded-full shadow-md border-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section>
          <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
            <div className="flex justify-center">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="all">Toutes les séries</TabsTrigger>
                <TabsTrigger value="recent">Récentes</TabsTrigger>
                <TabsTrigger value="popular">Populaires</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredSeries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">Aucune série trouvée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
              {filteredSeries.map((serie) => (
                <SeriesCard
                  key={serie.id}
                  id={serie.id}
                  name={serie.name}
                  logo={serie.logo}
                  releaseDate={serie.releaseDate}
                  cardCount={serie.cardCount}
                />
              ))}
            </div>
          )}
        </section>
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
