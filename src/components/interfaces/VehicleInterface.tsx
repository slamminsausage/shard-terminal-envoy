import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { typeTextWithSound } from '@/lib/typing';
import VehicleSheet from "@/components/crew/VehicleSheet";
import { useCampaign } from "@/contexts/CampaignContext";

export default function VehicleInterface() {
  const [displayText, setDisplayText] = useState("");
  const [showVehicleSheet, setShowVehicleSheet] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const { createNewVehicle, vehicles, deleteVehicle } = useCampaign();

  useEffect(() => {
    const initMessage = "VEHICLE MANAGEMENT SYSTEM ONLINE\nScanning for registered vessels and vehicles...\n\n";
    const cancelTyping = typeTextWithSound(initMessage, setDisplayText, undefined, { delay: 40 });
    
    return () => {
      if (typeof cancelTyping === 'function') {
        cancelTyping();
      }
    };
  }, []);

  const handleVehicleSheetAccess = (vehicleType?: string) => {
    setSelectedVehicle(vehicleType || null);
    setShowVehicleSheet(true);
  };

  const handleBackToVehicleInterface = () => {
    setShowVehicleSheet(false);
    setSelectedVehicle(null);
  };

  const handleRegisterNewVehicle = async (vehicleType: string) => {
    const newVehicle = await createNewVehicle(vehicleType);
    if (newVehicle) {
      setSelectedVehicle(vehicleType);
      setShowVehicleSheet(true);
      // Refresh the data to show the new vehicle
      window.location.reload(); // Simple refresh for now
    }
  };

  const handleCrewAssignment = (vehicleId: string) => {
    console.log('Assign crew to vehicle:', vehicleId);
    alert('Crew assignment functionality coming soon! For now, crew can be managed in the Character Sheets tab.');
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
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-mono">
            {selectedVehicle ? `${selectedVehicle.toUpperCase()} SHEET` : "VEHICLE SHEET INTERFACE"}
          </h2>
          <Button variant="outline" onClick={handleBackToVehicleInterface}>
            Back to Vehicle Management
          </Button>
        </div>
        <VehicleSheet />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-mono">VEHICLE MANAGEMENT SYSTEM</h2>
      </div>

      <Card className="bg-card/60 border-primary/30">
        <CardContent className="p-6">
          <div className="terminal terminal-flicker h-[200px] overflow-auto mb-4">
            <div className="font-mono text-sm whitespace-pre-wrap p-4">
              {displayText}
            </div>
          </div>
          
          <Tabs defaultValue="hangar" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hangar">Ship Hangar</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="hangar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono text-sm">REGISTERED SPACECRAFT</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Show existing vehicles */}
                    {vehicles.filter(v => v.vehicle_type === 'Ship').map((vehicle) => (
                      <div key={vehicle.id} className="p-4 border border-primary/20 rounded">
                        <div className="flex justify-between items-center">
                          <div className="font-mono text-sm">
                            <div className="font-semibold">{vehicle.name}</div>
                            <div className="text-xs opacity-70">{vehicle.class_type || 'Type-S Scout/Courier'}</div>
                            <div className="text-xs opacity-70">Status: ACTIVE</div>
                            <div className="text-xs opacity-70">
                              Crew: {vehicle.crew_requirements && Object.keys(vehicle.crew_requirements).length > 0 
                                ? Object.values(vehicle.crew_requirements).join(', ') 
                                : 'Unassigned'}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleVehicleSheetAccess("spacecraft")}
                            >
                              Access Sheet
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
                    
                    {/* VÁNAGANDR (hardcoded for now) */}
                    <div className="p-4 border border-primary/20 rounded">
                      <div className="flex justify-between items-center">
                        <div className="font-mono text-sm">
                          <div className="font-semibold">VÁNAGANDR</div>
                          <div className="text-xs opacity-70">Type-S Scout/Courier (Modified)</div>
                          <div className="text-xs opacity-70">Status: IMPOUNDED</div>
                          <div className="text-xs opacity-70">Crew: Unassigned</div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVehicleSheetAccess("spacecraft")}
                          >
                            Access Sheet
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCrewAssignment("vanagandr")}
                          >
                            Assign Crew
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-gray-400 border-gray-400 opacity-50 cursor-not-allowed"
                            disabled
                          >
                            Impounded
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {vehicles.filter(v => v.vehicle_type === 'Ship').length === 0 && (
                      <div className="p-4 border border-primary/20 rounded border-dashed opacity-50">
                        <div className="font-mono text-sm text-center">
                          [EMPTY BERTH] - Register new spacecraft
                        </div>
                      </div>
                    )}
                    
                    <Button variant="outline" className="w-full" onClick={() => handleRegisterNewVehicle("Ship")}>
                      Register New Spacecraft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="vehicles" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono text-sm">GROUND VEHICLES</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Show existing ground vehicles */}
                    {vehicles.filter(v => v.vehicle_type === 'Ground Vehicle').map((vehicle) => (
                      <div key={vehicle.id} className="p-4 border border-primary/20 rounded">
                        <div className="flex justify-between items-center">
                          <div className="font-mono text-sm">
                            <div className="font-semibold">{vehicle.name}</div>
                            <div className="text-xs opacity-70">{vehicle.class_type || 'Ground Vehicle'}</div>
                            <div className="text-xs opacity-70">Status: ACTIVE</div>
                            <div className="text-xs opacity-70">
                              Crew: {vehicle.crew_requirements && Object.keys(vehicle.crew_requirements).length > 0 
                                ? Object.values(vehicle.crew_requirements).join(', ') 
                                : 'Unassigned'}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleVehicleSheetAccess("vehicle")}
                            >
                              Access Sheet
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
                      <div className="p-4 border border-primary/20 rounded border-dashed opacity-50">
                        <div className="font-mono text-sm text-center">
                          [NO VEHICLES REGISTERED]
                        </div>
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleRegisterNewVehicle("Ground Vehicle")}
                    >
                      Register New Vehicle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="maintenance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono text-sm">MAINTENANCE SCHEDULE</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border border-primary/20 rounded">
                      <div className="font-mono text-sm">
                        <div className="font-semibold text-amber-400">VÁNAGANDR - CRITICAL</div>
                        <div className="text-xs opacity-70">Last maintenance: 200+ days ago</div>
                        <div className="text-xs opacity-70">Required: Full system overhaul</div>
                        <div className="text-xs opacity-70">Cost estimate: 50,000 Cr</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 border border-primary/20 rounded text-center">
                        <div className="font-mono text-xs font-semibold">HULL INTEGRITY</div>
                        <div className="font-mono text-lg text-amber-400">67%</div>
                      </div>
                      <div className="p-3 border border-primary/20 rounded text-center">
                        <div className="font-mono text-xs font-semibold">SYSTEM STATUS</div>
                        <div className="font-mono text-lg text-red-400">CRITICAL</div>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      Schedule Maintenance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}