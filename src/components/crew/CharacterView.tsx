import { useEffect, useRef, useCallback } from "react";
import { useCampaign } from "@/contexts/CampaignContext";
import CharacterSheet from "./CharacterSheet";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface CharacterViewProps {
  characterId: string;
}

const CharacterView = ({ characterId }: CharacterViewProps) => {
  const { characters, isLoading, refreshData } = useCampaign();
  const hasRefreshed = useRef(false);

  useEffect(() => {
    if (hasRefreshed.current) return;
    hasRefreshed.current = true;
    refreshData();
  }, [characterId, refreshData]);

  const character = characters.find(c => c.id === characterId);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (isLoading && !character) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading character data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Character Not Found</h1>
          <p>Unable to load character data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-y-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between print:hidden">
          <h1 className="text-lg font-mono tracking-[0.2em] text-primary">CHARACTER SHEET</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} size="sm" className="gap-1">
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button variant="outline" onClick={refreshData} size="sm">
              Refresh
            </Button>
          </div>
        </div>
        <CharacterSheet characterId={characterId} />
      </div>
    </div>
  );
};

export default CharacterView;
