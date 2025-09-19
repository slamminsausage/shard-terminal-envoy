import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { typeTextWithSound } from '@/lib/typing';
import CharacterSheet from "@/components/crew/CharacterSheet";

export default function CrewInterface() {
  const [displayText, setDisplayText] = useState("");
  const [activeCrewMember, setActiveCrewMember] = useState<string | null>(null);
  const [showCharacterSheet, setShowCharacterSheet] = useState(false);

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

  if (showCharacterSheet) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-mono">CHARACTER SHEET INTERFACE</h2>
          <Button variant="outline" onClick={handleBackToCrewInterface}>
            Back to Crew Management
          </Button>
        </div>
        <CharacterSheet />
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
                  </div>
                  <Button variant="outline" className="mt-4 w-full">
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
                      />
                    </div>
                    <Button variant="outline" size="sm">
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