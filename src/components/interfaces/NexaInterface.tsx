import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { typeTextWithSound } from '@/lib/typing';
import { Bot } from "lucide-react";

export default function NexaInterface() {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const initMessage = `NEXA AI ASSISTANT INITIALIZATION...
==================================

System Status: PENDING INTEGRATION
Database Schema: IN DEVELOPMENT
API Connection: CONFIGURING

NEXA is your personal campaign assistant, designed to help you:
• Access player-facing campaign information
• Query NPCs, Factions, and Locations from your sessions
• Explore lore and world-building details
• Get quick answers about your campaign universe

This feature is currently under development and will be available soon.

Stay tuned, Traveller...
`;

    const cancelTyping = typeTextWithSound(initMessage, setDisplayText, undefined, { delay: 30 });

    return () => {
      if (typeof cancelTyping === 'function') {
        cancelTyping();
      }
    };
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="space-y-6">
        {/* Header Card */}
        <Card className="terminal-card glow-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-primary font-mono">
              <Bot className="w-6 h-6" />
              NEXA AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="terminal-text whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {displayText}
            </pre>
          </CardContent>
        </Card>

        {/* Feature Preview Card */}
        <Card className="terminal-card">
          <CardHeader>
            <CardTitle className="text-primary/80 font-mono text-lg">
              Planned Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border border-primary/30 rounded-lg bg-black/40">
                <h3 className="text-primary font-mono text-sm font-bold mb-2">Campaign Database</h3>
                <p className="text-primary/70 font-mono text-xs">
                  Access your campaign wiki with NPCs, Factions, Locations, and more extracted from your game sessions.
                </p>
              </div>

              <div className="p-4 border border-primary/30 rounded-lg bg-black/40">
                <h3 className="text-primary font-mono text-sm font-bold mb-2">AI-Powered Queries</h3>
                <p className="text-primary/70 font-mono text-xs">
                  Ask NEXA questions about your campaign universe using natural language powered by Claude AI.
                </p>
              </div>

              <div className="p-4 border border-primary/30 rounded-lg bg-black/40">
                <h3 className="text-primary font-mono text-sm font-bold mb-2">Lore Management</h3>
                <p className="text-primary/70 font-mono text-xs">
                  Explore and search through your custom lore, world-building, and campaign history.
                </p>
              </div>

              <div className="p-4 border border-primary/30 rounded-lg bg-black/40">
                <h3 className="text-primary font-mono text-sm font-bold mb-2">Session Integration</h3>
                <p className="text-primary/70 font-mono text-xs">
                  NEXA automatically parses your sessions to keep the database current and relevant.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Notice */}
        <Card className="terminal-card border-primary/50">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-primary font-mono text-2xl mb-2 animate-pulse">
                [ COMING SOON ]
              </div>
              <p className="text-primary/60 font-mono text-sm">
                Integration in progress. Check back soon for updates.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
