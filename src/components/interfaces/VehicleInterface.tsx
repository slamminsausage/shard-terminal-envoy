import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { typeTextWithSound } from '@/lib/typing';
import VehicleSheet from "@/components/crew/VehicleSheet";
import CrewAssignmentDialog from "@/components/crew/CrewAssignmentDialog";
import PreMadeShipSelector from "@/components/crew/PreMadeShipSelector";
import { useCampaign } from "@/contexts/CampaignContext";
import { Vehicle } from "@/types/database";
import { preMadeShipToVehicle } from "@/lib/shipConversion";
import type { PreMadeShip } from "@/data/shipConstruction";

export default function VehicleInterface() {
  const [displayText, setDisplayText] = useState("");
  const [showVehicleSheet, setShowVehicleSheet] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [showCrewAssignment, setShowCrewAssignment] = useState(false);
  const [selectedVehicleForCrew, setSelectedVehicleForCrew] = useState<Vehicle | null>(null);
  const [showShipCatalog, setShowShipCatalog] = useState(false);
  const { createNewVehicle, saveVehicle, vehicles, deleteVehicle } = useCampaign();

  useEffect(() => {
    const initMessage = "VEHICLE MANAGEMENT SYSTEM ONLINE\nScanning for registered vessels and vehicles...\n\n";
    const cancelTyping = typeTextWithSound(initMessage, setDisplayText, undefined, { delay: 40 });
    
    return () => {
      if (typeof cancelTyping === 'function') {
        cancelTyping();
      }
    };
  }, []);

  const handleVehicleSheetAccess = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setShowVehicleSheet(true);
  };

  const handleBackToVehicleInterface = () => {
    setShowVehicleSheet(false);
    setSelectedVehicleId(null);
  };

  const handleRegisterNewVehicle = async (vehicleType: string) => {
    const newVehicle = await createNewVehicle(vehicleType);
    if (newVehicle) {
      setSelectedVehicleId(newVehicle.id);
      setShowVehicleSheet(true);
    }
  };

  const handleDeployFromCatalog = async (ship: PreMadeShip) => {
    const vehicleData = preMadeShipToVehicle(ship);
    const saved = await saveVehicle(vehicleData);
    if (saved) {
      setSelectedVehicleId(saved.id);
      setShowVehicleSheet(true);
    }
  };

  const handleCrewAssignment = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setSelectedVehicleForCrew(vehicle);
      setShowCrewAssignment(true);
    }
  };

  const handleCrewAssignmentComplete = (vehicleId: string, assignedCrew: string[]) => {
    // The vehicle list will be automatically updated by the context
    console.log(`Crew assignment completed for vehicle ${vehicleId}:`, assignedCrew);
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
      const success = await deleteVehicle(vehicleId);
      if (success) {
        // The vehicles list will be updated automatically by the context
        // No need to reload the page
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };

  if (showVehicleSheet) {
    return (
      <div className="interface-container">
        <header className="interface-header">
          <h2 className="interface-title">VEHICLE SHEET INTERFACE</h2>
          <button className="terminal-btn" onClick={handleBackToVehicleInterface}>
            Back to Vehicle Management
          </button>
        </header>
        <div className="interface-content">
          <VehicleSheet vehicleId={selectedVehicleId || undefined} />
        </div>
      </div>
    );
  }

  return (
    <div className="interface-container">
      <header className="interface-header">
        <div>
          <h2 className="interface-title">VEHICLE MANAGEMENT SYSTEM</h2>
          <p className="interface-subtitle">Manage spacecraft and ground vehicles</p>
        </div>
      </header>

      <div className="interface-content">
        <div className="panel mb-4">
          <div className="panel-content">
            <div className="terminal terminal-flicker h-[150px] overflow-auto border border-primary/30 rounded">
              <div className="font-mono text-sm whitespace-pre-wrap p-4 text-terminal-primary-light">
                {displayText}
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="hangar" className="w-full">
          <TabsList className="terminal-tabs-list grid-cols-2 mb-4">
            <TabsTrigger value="hangar" className="terminal-tab-trigger">Ship Hangar</TabsTrigger>
            <TabsTrigger value="vehicles" className="terminal-tab-trigger">Vehicles</TabsTrigger>
          </TabsList>
            
            <TabsContent value="hangar" className="space-y-4">
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">REGISTERED SPACECRAFT</span>
                </div>
                <div className="panel-content">
                  <div className="space-y-4">
                    {/* Show existing vehicles */}
                    {vehicles.filter(v => v.vehicle_type === 'Ship').map((vehicle) => (
                      <div key={vehicle.id} className="p-4 border border-primary/20 rounded bg-background/30">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="font-mono text-sm text-primary">
                            <div className="font-semibold">{vehicle.name}</div>
                            <div className="text-xs opacity-70">{vehicle.class_type || 'Type-S Scout/Courier'}</div>
                            <div className="text-xs opacity-70">Status: ACTIVE</div>
                            <div className="text-xs opacity-70">
                              Crew: {vehicle.crew_requirements && Object.keys(vehicle.crew_requirements).length > 0
                                ? Object.values(vehicle.crew_requirements).join(', ')
                                : 'Unassigned'}
                            </div>
                          </div>
                           <div className="flex flex-wrap gap-2">
                             <Button 
                               variant="outline" 
                               size="sm"
                               onClick={() => handleVehicleSheetAccess(vehicle.id)}
                             >
                               Edit Sheet
                             </Button>
                             <Button
                               onClick={() => {
                                 const url = `/vehicle-view/${vehicle.id}`;
                                 window.open(url, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                               }}
                               variant="secondary"
                               size="sm"
                             >
                               View
                             </Button>
                             <Button 
                               variant="outline" 
                               size="sm"
                               onClick={() => handleCrewAssignment(vehicle.id)}
                             >
                               Assign Crew
                             </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Spacecraft</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to permanently delete "{vehicle.name}"? This action cannot be undone. 
                                    Any crew assigned to this vessel will become unassigned.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteVehicle(vehicle.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Permanently
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    
                    {vehicles.filter(v => v.vehicle_type === 'Ship').length === 0 && (
                      <div className="p-4 border border-primary/20 rounded border-dashed opacity-50 bg-background/30">
                        <div className="font-mono text-sm text-center text-primary">
                          [EMPTY BERTH] - Register new spacecraft
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button className="terminal-btn flex-1" onClick={() => setShowShipCatalog(true)}>
                        Deploy from Catalog
                      </button>
                      <button className="terminal-btn flex-1" onClick={() => handleRegisterNewVehicle("Ship")}>
                        Custom Spacecraft
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vehicles" className="space-y-4">
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">GROUND VEHICLES</span>
                </div>
                <div className="panel-content">
                  <div className="space-y-4">
                    {/* Show existing ground vehicles */}
                    {vehicles.filter(v => v.vehicle_type === 'Ground Vehicle').map((vehicle) => (
                      <div key={vehicle.id} className="p-4 border border-primary/20 rounded bg-background/30">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="font-mono text-sm text-primary">
                            <div className="font-semibold">{vehicle.name}</div>
                            <div className="text-xs opacity-70">{vehicle.class_type || 'Ground Vehicle'}</div>
                            <div className="text-xs opacity-70">Status: ACTIVE</div>
                            <div className="text-xs opacity-70">
                              Crew: {vehicle.crew_requirements && Object.keys(vehicle.crew_requirements).length > 0
                                ? Object.values(vehicle.crew_requirements).join(', ')
                                : 'Unassigned'}
                            </div>
                          </div>
                           <div className="flex flex-wrap gap-2">
                             <Button 
                               variant="outline" 
                               size="sm"
                               onClick={() => handleVehicleSheetAccess(vehicle.id)}
                             >
                               Edit Sheet
                             </Button>
                             <Button
                               onClick={() => {
                                 const url = `/vehicle-view/${vehicle.id}`;
                                 window.open(url, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
                               }}
                               variant="secondary"
                               size="sm"
                             >
                               View
                             </Button>
                             <Button 
                               variant="outline" 
                               size="sm"
                               onClick={() => handleCrewAssignment(vehicle.id)}
                             >
                               Assign Crew
                             </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to permanently delete "{vehicle.name}"? This action cannot be undone. 
                                    Any crew assigned to this vehicle will become unassigned.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteVehicle(vehicle.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Permanently
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {vehicles.filter(v => v.vehicle_type === 'Ground Vehicle').length === 0 && (
                      <div className="p-4 border border-primary/20 rounded border-dashed opacity-50 bg-background/30">
                        <div className="font-mono text-sm text-center text-primary">
                          [NO VEHICLES REGISTERED]
                        </div>
                      </div>
                    )}
                    
                    <button
                      className="terminal-btn w-full"
                      onClick={() => handleRegisterNewVehicle("Ground Vehicle")}
                    >
                      Register New Vehicle
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>

        </Tabs>
      </div>

      {/* Crew Assignment Dialog */}
      {selectedVehicleForCrew && (
        <CrewAssignmentDialog
          open={showCrewAssignment}
          onOpenChange={setShowCrewAssignment}
          vehicle={selectedVehicleForCrew}
          onAssignmentComplete={handleCrewAssignmentComplete}
        />
      )}

      {/* Pre-Made Ship Catalog */}
      <PreMadeShipSelector
        open={showShipCatalog}
        onOpenChange={setShowShipCatalog}
        onSelectShip={handleDeployFromCatalog}
      />
    </div>
  );
}
