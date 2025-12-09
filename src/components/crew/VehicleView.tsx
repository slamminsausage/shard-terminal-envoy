import { useEffect, useRef } from "react";
import { useCampaign } from "@/contexts/CampaignContext";
import VehicleSheet from "./VehicleSheet";
import { Button } from "@/components/ui/button";

interface VehicleViewProps {
  vehicleId: string;
}

const VehicleView = ({ vehicleId }: VehicleViewProps) => {
  const { vehicles, isLoading, refreshData } = useCampaign();
  const hasRefreshed = useRef(false);

  useEffect(() => {
    if (hasRefreshed.current) return;
    hasRefreshed.current = true;
    refreshData();
  }, [vehicleId, refreshData]);

  const vehicle = vehicles.find(v => v.id === vehicleId);

  // Show loading state while data is being fetched
  if (isLoading && !vehicle) {
    return (
      <div className="h-screen bg-background text-foreground p-8 overflow-auto">
        <div className="max-w-4xl mx-auto flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading vehicle data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="h-screen bg-background text-foreground p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Vehicle Not Found</h1>
          <p>Unable to load vehicle data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground overflow-auto">
      <div className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-mono tracking-[0.2em] text-primary">VEHICLE SHEET</h1>
          <Button variant="outline" onClick={refreshData} size="sm">
            Refresh
          </Button>
        </div>
        <VehicleSheet vehicleId={vehicleId} />
      </div>
    </div>
  );
};

export default VehicleView;
