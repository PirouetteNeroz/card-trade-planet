
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Navbar from "@/components/Navbar";
import SeriesBlocksGrid from "@/components/SeriesBlocksGrid";
import SeriesCard from "@/components/SeriesCard";
import { findSeriesIdByName } from "@/lib/api-mapping";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { LayersIcon, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { fetchAllSeries, fetchInventory } from "@/lib/api";
import seriesBlocksData from '@/data/seriesBlocks.json';

const Index = () => {
  const [series, setSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCards, setTotalCards] = useState(0);

  useEffect(() => {
    fetchSeriesData();
    fetchCardCount();
  }, []);

  async function fetchSeriesData() {
    try {
      setIsLoading(true);
      const data = await fetchAllSeries();
      
      // Process the data for rendering
      const processedData = data.map((item: any) => {
        const processedItem = { ...item };
        
        // Handle complex objects that can't be directly rendered
        if (processedItem.cardCount && typeof processedItem.cardCount === 'object') {
          processedItem.cardCountDisplay = `${processedItem.cardCount.official || 0} cartes`;
        }
        
        // Try to find a matching logo URL from our JSON data
        const seriesBlock = seriesBlocksData.blocks.find(block => 
          block.series.some((s: any) => s.name === processedItem.name)
        );
        
        if (seriesBlock) {
          const matchingSeries = seriesBlock.series.find((s: any) => s.name === processedItem.name);
          if (matchingSeries) {
            processedItem.logo_url = matchingSeries.logo_url;
            processedItem.tcgdex_id = matchingSeries.id;
          }
        } else {
          // Try to find a mapping by name
          processedItem.tcgdex_id = findSeriesIdByName(processedItem.name);
        }
        
        return processedItem;
      });
      
      setSeries(processedData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCardCount() {
    try {
      // Try to get cached inventory from localStorage first
      const cachedInventory = localStorage.getItem("inventory-data");
      
      if (cachedInventory) {
        const inventoryData = JSON.parse(cachedInventory);
        setTotalCards(inventoryData.length);
      } else {
        const inventoryData = await fetchInventory();
        setTotalCards(inventoryData.length);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du compteur de cartes:', error);
      setTotalCards(0);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-slate-50 dark:from-background dark:to-slate-900/50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <main className="animate-fade-in">
          {/* Hero Section */}
          <section className="text-center py-12 mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              Découvrez l'univers des cartes Pokémon
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Explorez notre collection de cartes Pokémon classées par séries et extensions
            </p>
          </section>

          {/* Featured Content */}
          <section className="mb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover-scale">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <LayersIcon className="h-10 w-10 text-amber-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Collection</h3>
                  <p className="text-muted-foreground">{totalCards} cartes disponibles dans notre inventaire</p>
                </CardContent>
              </Card>
              
              <Card className="hover-scale">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <TrendingUp className="h-10 w-10 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Investissement</h3>
                  <p className="text-muted-foreground">Des cartes qui prennent de la valeur au fil du temps</p>
                </CardContent>
              </Card>
              
              <Card className="hover-scale">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <CheckCircle className="h-10 w-10 text-blue-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Authentifiées</h3>
                  <p className="text-muted-foreground">Chaque carte est vérifiée pour garantir son authenticité</p>
                </CardContent>
              </Card>
              
              <Card className="hover-scale">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <Clock className="h-10 w-10 text-purple-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nouveautés</h3>
                  <p className="text-muted-foreground">Restez à jour avec les dernières sorties</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Series Content */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-8 relative">
              <span className="relative z-10">Séries de cartes Pokémon</span>
              <span className="absolute bottom-0 left-0 w-20 h-1 bg-pokemon-red"></span>
            </h2>
            
            <Tabs defaultValue="blocks" className="mb-10">
              <TabsList className="mb-6">
                <TabsTrigger value="blocks">Par Blocs</TabsTrigger>
                <TabsTrigger value="all">Toutes les Séries</TabsTrigger>
              </TabsList>
              
              <TabsContent value="blocks" className="animate-fade-in">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <ErrorBoundary>
                    <SeriesBlocksGrid series={series} />
                  </ErrorBoundary>
                )}
              </TabsContent>
              
              <TabsContent value="all" className="animate-fade-in">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {series.map((serie) => (
                      <ErrorBoundary key={serie.id}>
                        <SeriesCard serie={serie} />
                      </ErrorBoundary>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Index;
