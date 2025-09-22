import { useEffect, useState } from "react";
import { useCampaign } from "@/contexts/CampaignContext";
import { Vehicle } from "@/types/database";

interface VehicleViewProps {
  vehicleId: string;
}

const VehicleView = ({ vehicleId }: VehicleViewProps) => {
  const { vehicles, isLoading } = useCampaign();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    const foundVehicle = vehicles.find(v => v.id === vehicleId);
    if (foundVehicle) {
      setVehicle(foundVehicle);
    }
  }, [vehicleId, vehicles]);

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
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
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Vehicle Not Found</h1>
          <p>Unable to load vehicle data.</p>
        </div>
      </div>
    );
  }

  const vehicleData = {
    shipInfo: {
      name: vehicle.name,
      className: vehicle.class_type,
      hullPoints: vehicle.hull,
      armour: vehicle.armor,
      powerPoints: vehicle.power_plant,
      softwareBandwidth: vehicle.computer_rating,
      fuelCost: 0,
      mortgage: 0,
      lifeSupport: 0,
      salaries: 0,
      maintenanceCost: vehicle.maintenance_cost
    },
    drives: {
      manoeuvreThrust: vehicle.maneuver_drive,
      jumpDriveJump: vehicle.jump_drive
    },
    systems: [],
    weapons: Array.isArray(vehicle.weapons) ? vehicle.weapons : [],
    cargo: [],
    criticalHits: {}
  };
  const { shipInfo, weapons, cargo, criticalHits } = vehicleData;

  const renderCriticalTrack = (trackName: string, boxes: number) => {
    const hits = criticalHits[trackName] || {};
    return (
      <div className="flex items-center gap-2 mb-2">
        <span className="w-20 text-sm font-medium">{trackName}:</span>
        <div className="flex gap-1">
          {Array.from({ length: boxes }, (_, i) => (
            <div
              key={i}
              className={`w-4 h-4 border border-border ${
                hits[i] ? 'bg-destructive' : 'bg-background'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto p-8 print:p-4">
        {/* Header */}
        <div className="border-2 border-border rounded-lg p-6 mb-6 bg-card">
          <h1 className="text-3xl font-bold mb-4 text-center">TRAVELLER VEHICLE SHEET</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Ship Name</label>
              <div className="border-b border-border pb-1 font-mono text-lg">{shipInfo.name || 'Unknown'}</div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Class</label>
              <div className="border-b border-border pb-1 font-mono">{shipInfo.className || '-'}</div>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">Hull Points</label>
              <div className="border-b border-border pb-1 font-mono">{shipInfo.hullPoints || '0'}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ship Specifications */}
          <div className="border border-border rounded-lg p-4 bg-card">
            <h2 className="text-xl font-bold mb-4">SPECIFICATIONS</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="font-medium">Armour</span>
                <span className="font-mono">{shipInfo.armour || '0'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="font-medium">Power Points</span>
                <span className="font-mono">{shipInfo.powerPoints || '0'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="font-medium">Software Bandwidth</span>
                <span className="font-mono">{shipInfo.softwareBandwidth || '0'}</span>
              </div>
              {vehicleData?.drives && (
                <>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="font-medium">Manoeuvre Thrust</span>
                    <span className="font-mono">{vehicleData.drives.manoeuvreThrust || '0'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="font-medium">Jump Drive</span>
                    <span className="font-mono">{vehicleData.drives.jumpDriveJump || '0'}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Operating Costs */}
          <div className="border border-border rounded-lg p-4 bg-card">
            <h2 className="text-xl font-bold mb-4">OPERATING COSTS</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="font-medium">Fuel Cost</span>
                <span className="font-mono">{shipInfo.fuelCost || '0'} Cr</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="font-medium">Mortgage</span>
                <span className="font-mono">{shipInfo.mortgage || '0'} Cr</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="font-medium">Life Support</span>
                <span className="font-mono">{shipInfo.lifeSupport || '0'} Cr</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="font-medium">Salaries</span>
                <span className="font-mono">{shipInfo.salaries || '0'} Cr</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/30">
                <span className="font-medium">Maintenance</span>
                <span className="font-mono">{shipInfo.maintenanceCost || '0'} Cr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Systems */}
        {vehicleData?.systems && vehicleData.systems.some((s: string) => s) && (
          <div className="mt-6 border border-border rounded-lg p-4 bg-card">
            <h2 className="text-xl font-bold mb-4">SYSTEMS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {vehicleData.systems.filter((s: string) => s).map((system: string, index: number) => (
                <div key={index} className="py-1 border-b border-border/30 font-mono text-sm">
                  {system}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weapons */}
        {weapons.length > 0 && weapons.some((w: any) => w.weapon) && (
          <div className="mt-6 border border-border rounded-lg p-4 bg-card">
            <h2 className="text-xl font-bold mb-4">WEAPONS</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2">Weapon</th>
                    <th className="text-left p-2">Mount</th>
                    <th className="text-left p-2">TL</th>
                    <th className="text-left p-2">Range</th>
                    <th className="text-left p-2">Damage</th>
                    <th className="text-left p-2">Traits</th>
                  </tr>
                </thead>
                <tbody>
                  {weapons.filter((w: any) => w.weapon).map((weapon: any, index: number) => (
                    <tr key={index} className="border-b border-border/30">
                      <td className="p-2 font-mono">{weapon.weapon}</td>
                      <td className="p-2 font-mono">{weapon.mount}</td>
                      <td className="p-2 font-mono">{weapon.tl}</td>
                      <td className="p-2 font-mono">{weapon.range}</td>
                      <td className="p-2 font-mono">{weapon.damage}</td>
                      <td className="p-2 font-mono">{weapon.traits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Cargo Hold */}
        {cargo.length > 0 && cargo.some((c: any) => c.description) && (
          <div className="mt-6 border border-border rounded-lg p-4 bg-card">
            <h2 className="text-xl font-bold mb-4">CARGO HOLD</h2>
            <div className="space-y-2">
              {cargo.filter((c: any) => c.description).map((item: any, index: number) => (
                <div key={index} className="flex justify-between py-2 border-b border-border/30">
                  <span className="font-mono">{item.description}</span>
                  <span className="font-mono">{item.tons} tons</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Critical Hits */}
        <div className="mt-6 border border-border rounded-lg p-4 bg-card">
          <h2 className="text-xl font-bold mb-4">CRITICAL HITS</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {[
              { label: "Armour", boxes: 6 },
              { label: "Bridge", boxes: 6 },
              { label: "Cargo", boxes: 6 },
              { label: "Crew", boxes: 6 },
              { label: "Fuel", boxes: 6 },
              { label: "Hull", boxes: 6 },
              { label: "J-Drive", boxes: 6 },
              { label: "M-Drive", boxes: 6 },
              { label: "Power Plant", boxes: 6 },
              { label: "Sensors", boxes: 6 },
              { label: "Weapons", boxes: 6 }
            ].map((track) => renderCriticalTrack(track.label, track.boxes))}
          </div>
        </div>

        {/* Assigned Crew */}
        {vehicle.crew_requirements && Object.keys(vehicle.crew_requirements).length > 0 && (
          <div className="mt-6 border border-border rounded-lg p-4 bg-card">
            <h2 className="text-xl font-bold mb-4">ASSIGNED CREW</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(vehicle.crew_requirements).map(([position, crewId]: [string, any], index: number) => (
                <div key={index} className="py-1 border-b border-border/30 font-mono text-sm">
                  {position}: {crewId || 'Unassigned'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleView;