import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Terminal, Users, Settings, FileText } from 'lucide-react';

type Tab = 'terminal' | 'logs' | 'crew' | 'settings';
type AccessMode = 'init' | 'terminal' | 'log';

interface Log {
  id?: string;
  title: string;
  location: string;
  date: string;
  author: string;
  content: string;
  security?: string;
  security_level?: string;
  roll?: number;
  tags?: string[];
  requires_roll?: boolean;
  roll_check?: {
    difficulty: number;
    skill: string;
    on_success: string;
    on_failure: string;
  };
}

interface Terminal {
  code: string;
  requiresRoll?: number;
  logs: string;
  name: string;
}

const VANAGANDR_BANNER = `
██╗   ██╗ █████╗ ███╗   ██╗ █████╗  ██████╗  █████╗ ███╗   ██╗██████╗ ██████╗ 
██║   ██║██╔══██╗████╗  ██║██╔══██╗██╔════╝ ██╔══██╗████╗  ██║██╔══██╗██╔══██╗
██║   ██║███████║██╔██╗ ██║███████║██║  ███╗███████║██╔██╗ ██║██║  ██║██████╔╝
╚██╗ ██╔╝██╔══██║██║╚██╗██║██╔══██║██║   ██║██╔══██║██║╚██╗██║██║  ██║██╔══██╗
 ╚████╔╝ ██║  ██║██║ ╚████║██║  ██║╚██████╔╝██║  ██║██║ ╚████║██████╔╝██║  ██║
  ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝
                    [ MAINFRAME SYSTEM ACCESS TERMINAL ]
                         [ ECLIPSE SHARD SAGA v5.0 ]
`;

const availableTerminals: Terminal[] = [
  {
    code: "fuw01",
    name: "Free Union Workers Terminal",
    logs: "/logs/fuw01.json",
    requiresRoll: 8
  },
  {
    code: "lysani01", 
    name: "Lysani Labs System",
    logs: "/logs/lysani01.json",
    requiresRoll: 10
  },
  {
    code: "vanagandr001",
    name: "Ship Vanagandr AI Core",
    logs: "/logs/vanagandr001.json",
    requiresRoll: 8
  }
];

const sampleLogs: Log[] = [
  {
    id: "log_001",
    title: "Jump Gate Malfunction - Kepler-442 System",
    location: "Kepler-442b Orbital Station",
    date: "2387.156",
    author: "Chief Engineer Valdez",
    content: "Quantum resonance cascade detected in primary jump gate matrix. Gravitic field generators showing anomalous readings. Recommend immediate shutdown and diagnostic sweep. Estimated repair time: 72 hours.\n\nAdditional notes: Unusual energy signatures detected during the malfunction. Pattern matches no known physics models. Engineering team requests xenoarchaeology consultation.",
    security: "CLASSIFIED",
    roll: 11,
    tags: ["engineering", "jump-gate", "anomaly", "crisis"]
  },
  {
    id: "log_002", 
    title: "First Contact Protocol Initiated",
    location: "Unknown Vessel - Vector 127.3",
    date: "2387.158",
    author: "Captain Morrison",
    content: "Unidentified craft approached our position at 0347 hours. Design unlike any known human or alien technology. Ship responded to standard first contact protocols with mathematical sequences. Translation matrix established.\n\nInitial communication suggests they call themselves 'The Architects'. Purpose unknown. Maintaining safe distance pending further orders from Naval Command.",
    security: "TOP SECRET",
    tags: ["first-contact", "aliens", "protocol", "architects"]
  },
  {
    id: "log_003",
    title: "Crew Psychological Evaluation - Quarterly Report",
    location: "Medical Bay 2",
    date: "2387.160", 
    author: "Dr. Sarah Chen",
    content: "Standard psychological evaluations completed for all crew members. Overall mental health remains stable despite recent anomalous events.\n\nNote: Several crew members report similar recurring dreams involving crystalline structures and mathematical patterns. Recommend monitoring for potential psychic phenomena.",
    security: "MEDICAL CONFIDENTIAL",
    tags: ["medical", "psychology", "crew", "dreams"]
  }
];

export default function MainframeShell() {
  const [activeTab, setActiveTab] = useState<Tab>('terminal');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLog, setCurrentLog] = useState<Log | null>(sampleLogs[0]);
  const [logs, setLogs] = useState<Log[]>(sampleLogs);
  
  // Access code system state
  const [accessMode, setAccessMode] = useState<AccessMode>('init');
  const [accessCode, setAccessCode] = useState('');
  const [activeTerminal, setActiveTerminal] = useState<Terminal | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<Log[]>([]);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [rollCheck, setRollCheck] = useState<{ difficulty: number; skill: string } | null>(null);
  const [terminalMessage, setTerminalMessage] = useState('');

  // Access code handler
  const handleAccessCode = async () => {
    const terminal = availableTerminals.find(t => t.code.toLowerCase() === accessCode.toLowerCase());
    
    if (terminal) {
      setActiveTerminal(terminal);
      setTerminalMessage(`Connecting to ${terminal.name}...`);
      
      if (terminal.requiresRoll) {
        setRollCheck({ difficulty: terminal.requiresRoll, skill: "Electronics (Computers)" });
      } else {
        await fetchTerminalLogs(terminal);
      }
    } else {
      setTerminalMessage("ACCESS DENIED. INVALID TERMINAL CODE.");
    }
    setAccessCode('');
  };

  // Fetch logs from terminal
  const fetchTerminalLogs = async (terminal: Terminal) => {
    try {
      const response = await fetch(terminal.logs);
      const data = await response.json();
      setTerminalLogs(data);
      setAccessMode('terminal');
      setTerminalMessage(`Connected to ${terminal.name}. Select a log entry to view.`);
    } catch (error) {
      setTerminalMessage("ERROR: Failed to load terminal data.");
    }
  };

  // Handle roll check result
  const handleRollResult = (passed: boolean) => {
    if (passed && activeTerminal) {
      fetchTerminalLogs(activeTerminal);
    } else {
      setTerminalMessage("ACCESS DENIED. INSUFFICIENT CLEARANCE.");
    }
    setRollCheck(null);
  };

  // Handle log access
  const handleLogAccess = (log: Log) => {
    if (log.requires_roll && log.roll_check) {
      setSelectedLog(log);
      setRollCheck({ difficulty: log.roll_check.difficulty, skill: log.roll_check.skill });
    } else {
      setSelectedLog(log);
      setAccessMode('log');
    }
  };

  // Handle log roll result
  const handleLogRollResult = (passed: boolean) => {
    if (passed && selectedLog) {
      setAccessMode('log');
      setTerminalMessage(selectedLog.roll_check?.on_success || "Access granted.");
    } else {
      setTerminalMessage(selectedLog?.roll_check?.on_failure || "Access denied.");
      setSelectedLog(null);
    }
    setRollCheck(null);
  };

  // Back to init
  const backToInit = () => {
    setAccessMode('init');
    setActiveTerminal(null);
    setTerminalLogs([]);
    setSelectedLog(null);
    setTerminalMessage('');
    setRollCheck(null);
  };

  // Back to terminal
  const backToTerminal = () => {
    setAccessMode('terminal');
    setSelectedLog(null);
    setRollCheck(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setActiveTab('logs');
      }
      if (e.key === 'Escape') {
        if (accessMode === 'log') {
          backToTerminal();
        } else if (accessMode === 'terminal') {
          backToInit();
        }
      }
      if (e.key === 'Enter' && accessMode === 'init' && accessCode.trim()) {
        handleAccessCode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [accessMode, accessCode]);

  const filteredLogs = logs.filter(log => 
    log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderTerminal = () => {
    if (rollCheck) {
      return (
        <div className="terminal-text p-6 space-y-4">
          <div className="bg-card/50 border-primary/30 p-4 rounded">
            <h3 className="text-primary font-bold mb-4">SECURITY CHECK REQUIRED</h3>
            <p className="text-foreground mb-4">
              Roll {rollCheck.difficulty}+ on {rollCheck.skill} to proceed.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => selectedLog ? handleLogRollResult(true) : handleRollResult(true)}
                className="bg-primary text-primary-foreground"
              >
                PASSED
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => selectedLog ? handleLogRollResult(false) : handleRollResult(false)}
              >
                FAILED
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (accessMode === 'log' && selectedLog) {
      return (
        <div className="terminal-text p-6 space-y-4">
          <Card className="bg-card/50 border-primary/30 p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h2 className="text-primary font-bold terminal-glow">{selectedLog.title}</h2>
                <span className="text-accent text-xs">{selectedLog.security_level?.toUpperCase() || selectedLog.security || 'STANDARD'}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>LOCATION: {selectedLog.location}</div>
                <div>DATE: {selectedLog.date}</div>
                <div>AUTHOR: {selectedLog.author}</div>
              </div>
              
              <div className="border-t border-primary/20 pt-3">
                <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                  {selectedLog.content}
                </pre>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <Button variant="outline" size="sm" onClick={backToTerminal}>
                  BACK TO TERMINAL
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    if (accessMode === 'terminal' && activeTerminal) {
      return (
        <div className="terminal-text p-6 space-y-4">
          <div className="space-y-2 text-sm">
            <div className="text-accent">CONNECTED TO: {activeTerminal.name}</div>
            <div className="text-accent">STATUS: OPERATIONAL</div>
            <div className="text-accent">CLEARANCE LEVEL: RESTRICTED</div>
            {terminalMessage && (
              <div className="text-primary terminal-glow">{terminalMessage}</div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-primary font-bold terminal-glow">AVAILABLE LOG ENTRIES:</h3>
            {terminalLogs.map((log, index) => (
              <Card 
                key={index}
                className="bg-card/30 border-primary/20 p-3 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => handleLogAccess(log)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-primary font-semibold text-sm">{log.title}</h4>
                    <p className="text-muted-foreground text-xs mt-1">{log.date} - {log.author}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-accent text-xs">{log.security_level?.toUpperCase() || 'STANDARD'}</span>
                    {log.requires_roll && (
                      <span className="text-yellow-400 text-xs mt-1">RESTRICTED</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            
            <div className="pt-4">
              <Button variant="outline" size="sm" onClick={backToInit}>
                DISCONNECT
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="terminal-text p-6 space-y-4">
        <pre className="text-xs terminal-glow text-primary whitespace-pre-wrap">
          {VANAGANDR_BANNER}
        </pre>
        
        <div className="space-y-2 text-sm">
          <div className="text-accent">SYSTEM STATUS: OPERATIONAL</div>
          <div className="text-accent">ACCESS LEVEL: GUEST</div>
          <div className="text-accent">AWAITING TERMINAL CODE...</div>
          {terminalMessage && (
            <div className="text-primary terminal-glow mt-4">{terminalMessage}</div>
          )}
        </div>

        <div className="space-y-4">
          <div className="text-accent text-sm">ENTER TERMINAL ACCESS CODE:</div>
          <div className="flex gap-2">
            <Input
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="ACCESS CODE"
              className="bg-card/50 border-primary/30 text-primary placeholder:text-muted-foreground font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleAccessCode()}
            />
            <Button 
              variant="default" 
              onClick={handleAccessCode}
              disabled={!accessCode.trim()}
              className="bg-primary text-primary-foreground"
            >
              CONNECT
            </Button>
          </div>
          
          <div className="text-muted-foreground text-xs mt-4">
            <div>AVAILABLE TERMINALS:</div>
            {availableTerminals.map(terminal => (
              <div key={terminal.code} className="mt-1">
                <span className="text-accent">{terminal.code}</span> - {terminal.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderLogs = () => (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="search-input"
            placeholder="Search logs... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border text-foreground"
          />
        </div>
        <Button variant="outline" size="sm">
          New Log (Ctrl+N)
        </Button>
      </div>

      <div className="space-y-3">
        {filteredLogs.map(log => (
          <Card 
            key={log.id}
            className={`p-4 cursor-pointer border transition-colors hover:border-primary/50 ${
              currentLog?.id === log.id ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onClick={() => {
              setCurrentLog(log);
              setActiveTab('terminal');
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-primary font-semibold">{log.title}</h3>
              <span className="text-xs text-accent">{log.security}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground mb-3">
              <div>{log.location}</div>
              <div>{log.date}</div>
              <div>{log.author}</div>
            </div>
            
            <p className="text-sm text-foreground/80 line-clamp-2 mb-3">
              {log.content.substring(0, 150)}...
            </p>
            
            <div className="flex gap-1">
              {log.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs px-2 py-1 bg-accent/20 text-accent rounded">
                  #{tag}
                </span>
              ))}
              {log.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">+{log.tags.length - 3} more</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCrew = () => (
    <div className="p-6">
      <h2 className="text-primary font-bold mb-4 terminal-glow">CREW MANIFEST</h2>
      <p className="text-muted-foreground">Character management system coming soon...</p>
    </div>
  );

  const renderSettings = () => (
    <div className="p-6 space-y-6">
      <h2 className="text-primary font-bold mb-4 terminal-glow">SYSTEM CONFIGURATION</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-accent mb-2">CRT Effects</h3>
          <p className="text-muted-foreground text-sm">Scanlines, flicker, and glow effects are currently enabled.</p>
        </div>
        
        <div>
          <h3 className="text-accent mb-2">Import/Export</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Import Logs</Button>
            <Button variant="outline" size="sm">Export Data</Button>
          </div>
        </div>
        
        <div>
          <h3 className="text-accent mb-2">System Info</h3>
          <div className="text-sm space-y-1 text-muted-foreground">
            <div>TERMINAL VERSION: v5.0</div>
            <div>CORE SYSTEM: Eclipse Shard Saga</div>
            <div>LAST BOOT: 2387.160.0847</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="crt-container w-screen h-screen flex flex-col">
      {/* Terminal Header */}
      <div className="bg-card border-b border-primary/30 p-4">
        <div className="flex items-center justify-between">
          <div className="text-primary font-bold terminal-glow">
            VÁNAGANDR MAINFRAME SYSTEM
          </div>
          <div className="text-xs text-accent">
            [{new Date().toISOString().slice(0, 19).replace('T', ' ')}]
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-card border-b border-primary/30 p-2">
        <div className="flex gap-1">
          {[
            { id: 'terminal', label: 'TERMINAL', icon: Terminal },
            { id: 'logs', label: 'LOGS', icon: FileText },
            { id: 'crew', label: 'CREW & SHEETS', icon: Users },
            { id: 'settings', label: 'SETTINGS', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeTab === id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(id as Tab)}
              className={`text-xs font-mono ${
                activeTab === id ? 'text-primary-foreground' : 'text-foreground hover:text-primary'
              }`}
            >
              <Icon className="w-3 h-3 mr-2" />
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'terminal' && renderTerminal()}
        {activeTab === 'logs' && renderLogs()}
        {activeTab === 'crew' && renderCrew()}
        {activeTab === 'settings' && renderSettings()}
      </div>

      {/* Status Bar */}
      <div className="bg-card border-t border-primary/30 p-2 text-xs text-muted-foreground">
        <div className="flex justify-between items-center">
          <div>STATUS: ONLINE | LOGS: {logs.length} | ACTIVE: {currentLog?.title || 'NONE'}</div>
          <div className="flex items-center gap-4">
            <span>CTRL+K: Search</span>
            <span>CTRL+N: New Log</span>
          </div>
        </div>
      </div>
    </div>
  );
}