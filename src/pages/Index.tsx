import { useState, useEffect } from "react";
import SeriesCard from "@/components/SeriesCard";
import { logObject } from "@/lib/debugUtils";

// Add this debug component to analyze data
const DebugData = ({ data }: { data: any }) => {
  useEffect(() => {
    logObject("Series data", data);
  }, [data]);
  
  return null;
};

const Index = () => {
  const [series, setSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllSeries();
  }, []);

  async function fetchAllSeries() {
    try {
      const response = await fetch('https://api.tcgdex.net/v2/fr/sets');
      if (!response.ok) throw new Error('Impossible de récupérer les séries');
      const data = await response.json();
      
      // Log the data to see its structure
      console.log("API Response:", data);
      
      // Make sure we transform any complex objects into renderable format
      const processedData = data.map((item: any) => {
        // Check if item contains complex objects that can't be directly rendered
        const processedItem = { ...item };
        
        // Handle known problematic fields (like objects with total/official)
        if (processedItem.cardCount && typeof processedItem.cardCount === 'object') {
          processedItem.cardCountDisplay = `${processedItem.cardCount.official || 0} (Total: ${processedItem.cardCount.total || 0})`;
          // Keep the original data for other uses
        }
        
        return processedItem;
      });
      
      setSeries(processedData);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false); // Fixed: Changed from setIsLoading.value = false to setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DebugData data={series} />
      <main>
        <section className="mb-10">
          <h1 className="text-3xl font-bold mb-6">Séries de cartes Pokémon</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {isLoading ? (
              <p>Chargement des séries...</p>
            ) : (
              series.map((serie) => (
                <SeriesCard key={serie.id} serie={serie} />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
