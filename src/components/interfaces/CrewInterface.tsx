import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { typeTextWithSound } from '@/lib/typing';
import CharacterSheet from "@/components/crew/CharacterSheet";
import { useCampaign } from "@/contexts/CampaignContext";
import { toast } from "@/hooks/use-toast";

export default function CrewInterface() {
  const [displayText, setDisplayText] = useState("");
  const [activeCrewMember, setActiveCrewMember] = useState<string | null>(null);
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);
  const [missionNotes, setMissionNotes] = useState(() => {
    // Load mission notes from localStorage on component mount
    return localStorage.getItem('mission_notes') || "";
  });
  const { createNewCharacter, characters, deleteCharacter } = useCampaign();
  const [characterToDelete, setCharacterToDelete] = useState<string | null>(null);

  useEffect(() => {
    const initMessage = "CREW MANAGEMENT SYSTEM ONLINE\nAccess crew records and character sheets...\n\n";
    const cancelTyping = typeTextWithSound(initMessage, setDisplayText, undefined, { delay: 40 });
    
    return () => {
      if (typeof cancelTyping === 'function') {
        cancelTyping();
      }
    };
  }, []);

  const handleCharacterSheetAccess = () => {
    setShowCharacterSheet(true);
  };

  const handleBackToCrewInterface = () => {
    setShowCharacterSheet(false);
    setActiveCrewMember(null);
  };

  const handleAddNewCrewMember = async () => {
    const newCharacter = await createNewCharacter();
    if (newCharacter) {
      setShowCharacterSheet(true);
    }
  };

  const handleSaveNotes = () => {
    try {
      localStorage.setItem('mission_notes', missionNotes);
      toast({
        title: "Mission Notes Saved",
        description: "Your mission notes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save mission notes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCharacter = async (characterId: string) => {
    const success = await deleteCharacter(characterId);
    if (success) {
      setCharacterToDelete(null);
    }
  };

  if (showCharacterSheet) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-mono">CHARACTER SHEET INTERFACE</h2>
          <Button variant="outline" onClick={handleBackToCrewInterface}>
            Back to Crew Management
          </Button>
        </div>
        <CharacterSheet characterId={activeCrewMember || undefined} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-mono">CREW MANAGEMENT SYSTEM</h2>
      </div>

      <Card className="bg-card/60 border-primary/30">
        <CardContent className="p-6">
          <div className="terminal terminal-flicker h-[200px] overflow-auto mb-4">
            <div className="font-mono text-sm whitespace-pre-wrap p-4">
              {displayText}
            </div>
          </div>
          
          <Tabs defaultValue="roster" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="roster">Crew Roster</TabsTrigger>
              <TabsTrigger value="sheets">Character Sheets</TabsTrigger>
              <TabsTrigger value="notes">Mission Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="roster" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono text-sm">ACTIVE CREW MEMBERS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {characters.length > 0 ? (
                      characters.map((character, index) => (
                        <div key={character.id} className="p-3 border border-primary/20 rounded font-mono text-sm flex justify-between items-center">
                          <span>SLOT {String(index + 1).padStart(2, '0')}: {character.name} - {character.career || 'Unassigned'}</span>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setActiveCrewMember(character.id);
                                setShowCharacterSheet(true);
                              }}
                            >
                              Edit
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white">
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Character</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to permanently delete "{character.name}"? This action cannot be undone. 
                                    The character will be removed from any ship crew assignments.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteCharacter(character.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Permanently
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="p-3 border border-primary/20 rounded font-mono text-sm">
                          SLOT 01: [VACANT] - Assign crew member
                        </div>
                        <div className="p-3 border border-primary/20 rounded font-mono text-sm">
                          SLOT 02: [VACANT] - Assign crew member
                        </div>
                        <div className="p-3 border border-primary/20 rounded font-mono text-sm">
                          SLOT 03: [VACANT] - Assign crew member
                        </div>
                        <div className="p-3 border border-primary/20 rounded font-mono text-sm">
                          SLOT 04: [VACANT] - Assign crew member
                        </div>
                      </>
                    )}
                  </div>
                  <Button variant="outline" className="mt-4 w-full" onClick={handleAddNewCrewMember}>
                    Add New Crew Member
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sheets" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono text-sm">CHARACTER SHEET ACCESS</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-sm mb-4 opacity-70">
                    Access and manage character sheets for crew members.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleCharacterSheetAccess}
                  >
                    Open Character Sheet Interface
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-mono text-sm">MISSION NOTES</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="mission-notes" className="font-mono text-xs">
                        Current Mission Status
                      </Label>
                      <textarea 
                        id="mission-notes"
                        className="w-full h-32 bg-background/20 border border-primary/30 rounded p-3 font-mono text-sm"
                        placeholder="Enter mission notes and status updates..."
                        value={missionNotes}
                        onChange={(e) => setMissionNotes(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={handleSaveNotes}>
                      Save Notes
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