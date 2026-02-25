import React, { useState, useRef } from 'react';
import { Download, Upload, FileJson, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useCampaign } from '@/contexts/CampaignContext';
import { useJumpPlanner } from '@/contexts/JumpPlannerContext';
import {
  downloadCampaignData,
  parseCampaignImport,
  downloadJSON,
  type CampaignExport
} from '@/lib/exportImport';
import { toast } from 'sonner';
import { dbHelpers } from '@/lib/supabase';

interface ExportImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportImportDialog({ isOpen, onClose }: ExportImportDialogProps) {
  const { characters, vehicles, saveCharacter, saveVehicle } = useCampaign();
  const { allNotes, hexMarkers, loadAllNotes, loadAllMarkers, saveMarker } = useJumpPlanner();

  const [importedData, setImportedData] = useState<CampaignExport | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportAll = () => {
    downloadCampaignData(characters, vehicles, allNotes, hexMarkers);
    toast.success('Campaign data exported successfully!');
  };

  const handleExportCharacters = () => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      type: 'characters',
      data: characters,
    };
    downloadJSON(data, `characters-export-${Date.now()}.json`);
    toast.success(`Exported ${characters.length} character(s)`);
  };

  const handleExportVehicles = () => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      type: 'vehicles',
      data: vehicles,
    };
    downloadJSON(data, `vehicles-export-${Date.now()}.json`);
    toast.success(`Exported ${vehicles.length} vehicle(s)`);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const data = parseCampaignImport(content);

      if (!data) {
        setImportError('Invalid file format. Please select a valid campaign export file.');
        setImportedData(null);
        return;
      }

      setImportedData(data);
      setImportError(null);
    };

    reader.onerror = () => {
      setImportError('Failed to read file');
      setImportedData(null);
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importedData) return;

    setIsImporting(true);
    let importedCount = 0;
    let errorCount = 0;

    try {
      // Import characters
      for (const char of importedData.characters) {
        try {
          // Remove id to create new records
          const { id, ...charData } = char;
          await saveCharacter(charData);
          importedCount++;
        } catch (error) {
          console.error('Failed to import character:', char.name, error);
          errorCount++;
        }
      }

      // Import vehicles
      for (const vehicle of importedData.vehicles) {
        try {
          // Remove id to create new records
          const { id, ...vehicleData } = vehicle;
          await saveVehicle(vehicleData);
          importedCount++;
        } catch (error) {
          console.error('Failed to import vehicle:', vehicle.name, error);
          errorCount++;
        }
      }

      // Import world notes
      for (const note of (importedData.worldNotes ?? [])) {
        try {
          const { id, created_at, updated_at, ...noteData } = note;
          await dbHelpers.saveWorldNote(noteData);
          importedCount++;
        } catch (error) {
          console.error('Failed to import world note:', note.sector, note.hex, error);
          errorCount++;
        }
      }

      // Import hex markers
      for (const marker of (importedData.hexMarkers ?? [])) {
        try {
          const { id, created_at, updated_at, ...markerData } = marker;
          await saveMarker(markerData);
          importedCount++;
        } catch (error) {
          console.error('Failed to import hex marker:', marker.marker_label, error);
          errorCount++;
        }
      }

      await Promise.all([loadAllNotes(), loadAllMarkers()]);

      if (errorCount === 0) {
        toast.success(`Successfully imported ${importedCount} items!`);
      } else {
        toast.warning(`Imported ${importedCount} items with ${errorCount} errors`);
      }

      setImportedData(null);
      onClose();
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import campaign data');
    } finally {
      setIsImporting(false);
    }
  };

  const stats = {
    characters: characters.length,
    vehicles: vehicles.length,
    notes: allNotes.length,
    markers: hexMarkers.length,
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileJson className="w-5 h-5" />
              Export / Import Campaign Data
            </DialogTitle>
            <DialogDescription>
              Backup your campaign data or import from a previous export
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="export">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
            </TabsList>

            <TabsContent value="export" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{stats.characters}</div>
                      <div className="text-xs text-muted-foreground">Characters</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{stats.vehicles}</div>
                      <div className="text-xs text-muted-foreground">Vehicles</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{stats.notes}</div>
                      <div className="text-xs text-muted-foreground">Notes</div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{stats.markers}</div>
                      <div className="text-xs text-muted-foreground">Markers</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleExportAll}
                      className="w-full"
                      size="lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export All Campaign Data
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={handleExportCharacters}
                        variant="outline"
                        disabled={characters.length === 0}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Characters Only
                      </Button>
                      <Button
                        onClick={handleExportVehicles}
                        variant="outline"
                        disabled={vehicles.length === 0}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Vehicles Only
                      </Button>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertTitle>Export Format</AlertTitle>
                    <AlertDescription>
                      Data is exported as JSON and includes all characters, vehicles, world notes, and hex markers. The file can be re-imported later.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {!importedData ? (
                    <div className="space-y-4">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                        size="lg"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Select Campaign File
                      </Button>

                      {importError && (
                        <Alert variant="destructive">
                          <AlertCircle className="w-4 h-4" />
                          <AlertTitle>Import Error</AlertTitle>
                          <AlertDescription>{importError}</AlertDescription>
                        </Alert>
                      )}

                      <Alert>
                        <AlertCircle className="w-4 h-4" />
                        <AlertTitle>Import Process</AlertTitle>
                        <AlertDescription>
                          Select a campaign export JSON file. All items will be created as new entries in your campaign.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Alert>
                        <CheckCircle className="w-4 h-4" />
                        <AlertTitle>File Loaded Successfully</AlertTitle>
                        <AlertDescription>
                          Exported on: {new Date(importedData.exportDate).toLocaleString()}
                        </AlertDescription>
                      </Alert>

                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-primary">
                            {importedData.characters.length}
                          </div>
                          <div className="text-xs text-muted-foreground">Characters</div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-primary">
                            {importedData.vehicles.length}
                          </div>
                          <div className="text-xs text-muted-foreground">Vehicles</div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-primary">
                            {importedData.worldNotes.length}
                          </div>
                          <div className="text-xs text-muted-foreground">Notes</div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-primary">
                            {importedData.hexMarkers.length}
                          </div>
                          <div className="text-xs text-muted-foreground">Markers</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => setImportedData(null)}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleImport}
                          disabled={isImporting}
                          className="flex-1"
                        >
                          {isImporting ? 'Importing...' : 'Import Campaign Data'}
                        </Button>
                      </div>

                      <Alert variant="destructive">
                        <AlertCircle className="w-4 h-4" />
                        <AlertTitle>Warning</AlertTitle>
                        <AlertDescription>
                          This will create new entries. Existing data will not be overwritten.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
