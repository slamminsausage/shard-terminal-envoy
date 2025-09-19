import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SignalInterference from '../SignalInterference';
import audioManager from '@/lib/audioManager';
import { typeTextWithSound } from '@/lib/typing';
import { applyGlitch } from '@/lib/glitchText';

// Terminal definitions
interface Terminal {
  requiresRoll: number | boolean;
  logs: string;
  requiresPassword?: boolean;
  password?: string;
}

const terminals: Record<string, Terminal> = {
  "lysani01": { requiresRoll: 8, logs: "/logs/lysani01.json" },
  "s.elara01": { requiresRoll: false, logs: "/logs/s.elara01.json" },
  "slocombe875": { requiresRoll: 8, logs: "/logs/slocombe875.json" },
  "waferterm01": { requiresRoll: false, logs: "/logs/waferterm01.json" },
  "labpc81": { requiresRoll: 6, logs: "/logs/labpc81.json" },
  "vanagandr001": { requiresRoll: 8, logs: "/logs/vanagandr001.json" },
  "blackcircuit01": { requiresRoll: 8, logs: "/logs/blackcircuit01.json" },
  "fuw01": { requiresRoll: 8, logs: "/logs/fuw01.json" },
  "azura01": { requiresRoll: 10, logs: "/logs/azura01.json" },
  "vennik01": { requiresRoll: 12, logs: "/logs/vennik01.json", requiresPassword: true, password: "vennik4ever" },
  "caldonis_public": { requiresRoll: false, logs: "/logs/caldonis_public.json" },
  "blacksite-es1": { requiresRoll: 10, logs: "/logs/blacksite-es1.json" },
  "blacktalon": { requiresRoll: 12, logs: "/logs/blacktalon.json" },
  "vennik-personal": { requiresRoll: 10, logs: "/logs/vennik-personal.json" },
  "sayelle-logs": { requiresRoll: 8, logs: "/logs/sayelle-logs.json" },
  "fuwnet": { requiresRoll: 8, logs: "/logs/fuw-network.json" },
  "01-1485-10-4-89-40": { requiresRoll: false, logs: "/logs/01-1485-10-4-89-40.json" }
};

// Terminal visual effects
const getTerminalEffectClasses = (terminalId: string) => {
  if (!terminalId) return "terminal terminal-flicker";

  const terminalName = terminalId.includes("/")
    ? terminalId.replace("/logs/", "").replace(".json", "")
    : terminalId;

  const damagedTerminals = ["blacksite-es1", "sayelle-logs", "vennik-personal"];
  const minorGlitchTerminals = ["fuwnet", "vanagandr001", "fuw01", "blacktalon"];

  if (damagedTerminals.includes(terminalName)) {
    return "terminal terminal-severe-flicker terminal-scanlines";
  }

  if (minorGlitchTerminals.includes(terminalName)) {
    return "terminal terminal-flicker terminal-scanlines";
  }

  return "terminal terminal-flicker";
};

export default function TerminalInterface() {
  const navigate = useNavigate();
  const hasInitialized = useRef(false);
  const typingRef = useRef<number | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // Core state
  const [initText, setInitText] = useState("");
  const [initComplete, setInitComplete] = useState(false);
  const [currentView, setCurrentView] = useState("init");
  const [inputCode, setInputCode] = useState("");
  const [terminalData, setTerminalData] = useState("");
  
  // Terminal state
  const [activeTerminal, setActiveTerminal] = useState<Terminal | null>(null);
  const [logData, setLogData] = useState<any>(null);
  const [selectedLogData, setSelectedLogData] = useState<any>(null);
  const [displayedText, setDisplayedText] = useState("");
  const [logTypingComplete, setLogTypingComplete] = useState(false);
  
  // Security state
  const [rollCheck, setRollCheck] = useState<any>(null);
  const [specialRollCheck, setSpecialRollCheck] = useState<any>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [terminalPasswordRequired, setTerminalPasswordRequired] = useState(false);
  const [terminalPasswordInput, setTerminalPasswordInput] = useState("");
  const [terminalPasswordAttempts, setTerminalPasswordAttempts] = useState(0);
  
  // Visual effects state
  const [severeMalfunction, setSevereMalfunction] = useState(false);
  const [glitchText, setGlitchText] = useState("");
  
  // Command mode state
  const [commandMode, setCommandMode] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandOutput, setCommandOutput] = useState<any[]>([]);

  // Audio logs state
  const [showAudioLogsPage, setShowAudioLogsPage] = useState(false);
  const [audioLogsData, setAudioLogsData] = useState<any[]>([]);

  // Signal interference
  const [signalInterferenceLevel, setSignalInterferenceLevel] = useState(0);

  // Initialize terminal
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    const loadingMessages = [
      "Initializing system...",
      "Connecting to network...",
      "Loading secure protocols...",
      "The Traveller Terminal is now online."
    ];
    
    let i = 0;
    const displayNextMessage = () => {
      if (i < loadingMessages.length) {
        const cancelTyping = typeTextWithSound(loadingMessages[i] + "\n", setInitText, () => {
          setInitText(prev => prev + "\n");
          i++;
          displayNextMessage();
        }, { delay: 50 });
        typingRef.current = cancelTyping as any;
      } else {
        const welcomeMessage =
          "\nWelcome to The Traveller Terminal.\n" +
          "Type the name of a terminal to access its contents.\n" +
          "Press ESC at any time to go back.\n\n";
        const cancelTyping = typeTextWithSound(welcomeMessage, setInitText, () => {
          setInitComplete(true);
        }, { delay: 50 });
        typingRef.current = cancelTyping as any;
      }
    };
    displayNextMessage();
  }, []);

  // Handle access code
  const handleAccessCode = (codeOverride: string | null = null) => {
    const rawCode = typeof codeOverride === "string" ? codeOverride : inputCode;
    const trimmedCode = rawCode.trim();
    
    if (!trimmedCode) {
      const cancelTyping = typeTextWithSound("ACCESS DENIED. INVALID CODE.", setTerminalData);
      typingRef.current = cancelTyping as any;
      setInputCode("");
      return;
    }
    
    const normalizedCode = trimmedCode.toLowerCase();
    
    const terminal = terminals[normalizedCode as keyof typeof terminals];
    if (terminal) {
      setActiveTerminal(terminal);
      setCurrentView("terminal");
      
      if (terminal.requiresPassword) {
        setTerminalPasswordRequired(true);
      } else if (terminal.requiresRoll) {
        setRollCheck({ difficulty: terminal.requiresRoll });
      } else {
        fetchLogs(terminal.logs);
      }
    } else {
      const cancelTyping = typeTextWithSound("ACCESS DENIED. INVALID CODE.", setTerminalData);
      typingRef.current = cancelTyping as any;
    }
    
    setInputCode("");
  };

  // Fetch logs
  const fetchLogs = async (logPath: string) => {
    try {
      const response = await fetch(logPath);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setLogData(data);
      } else {
        setSelectedLogData(data);
        setCurrentView("log");
        setDisplayedText("");
        setLogTypingComplete(false);
        
        let message = `Date: ${data.date}\nAuthor: ${data.author}\n\n${data.content || "No data available."}`;
        
        if (activeTerminal) {
          const glitchResult = applyGlitch(message, activeTerminal.logs);
          message = glitchResult.text;
        }
        
        const cancelTyping = typeTextWithSound(message, setDisplayedText, () => {
          setLogTypingComplete(true);
        }, { delay: 30 });
        typingRef.current = cancelTyping as any;
      }
    } catch (error) {
      const cancelTyping = typeTextWithSound("ERROR LOADING LOGS.", setTerminalData);
      typingRef.current = cancelTyping as any;
    }
  };

  // Handle log click
  const handleLogClick = (log: any) => {
    setSelectedLogData(log);
    setCurrentView("log");
    setPasswordAttempts(0);
    setPasswordInput("");
    
    if (log.requires_roll && log.roll_check && log.roll_check.difficulty >= 10) {
      setSpecialRollCheck({ difficulty: log.roll_check.difficulty });
    } else {
      setDisplayedText("");
      setLogTypingComplete(false);
      
      let message = `Date: ${log.date}\nAuthor: ${log.author}\n\n${log.content}`;
      
      if (activeTerminal) {
        const glitchResult = applyGlitch(message, activeTerminal.logs);
        message = glitchResult.text;
      }

      const cancelTyping = typeTextWithSound(message, setDisplayedText, () => {
        setLogTypingComplete(true);
      }, { delay: 30 });
      typingRef.current = cancelTyping as any;
    }
  };

  // Roll check handler
  const handleRollCheck = (passed: boolean) => {
    if (passed) {
      if (activeTerminal) {
        fetchLogs(activeTerminal.logs);
      } else {
        const cancelTyping = typeTextWithSound("ERROR: Terminal not found.", setTerminalData);
        typingRef.current = cancelTyping as any;
      }
    } else {
      const cancelTyping = typeTextWithSound("ACCESS DENIED. INSUFFICIENT CLEARANCE.", setTerminalData);
      typingRef.current = cancelTyping as any;
    }
    setRollCheck(null);
  };

  // Special roll check handler
  const handleSpecialRollCheck = (passed: boolean) => {
    if (passed && selectedLogData) {
      setDisplayedText("");
      setLogTypingComplete(false);
      setCurrentView("log");
      
      let message = "";
      if (selectedLogData.roll_check && selectedLogData.roll_check.on_success) {
        message = selectedLogData.roll_check.on_success + "\n\n";
        message += `Date: ${selectedLogData.date}\nAuthor: ${selectedLogData.author}\n\n${selectedLogData.content}`;
      } else {
        message = `Date: ${selectedLogData.date}\nAuthor: ${selectedLogData.author}\n\n${selectedLogData.content}`;
      }
      
      if (activeTerminal) {
        const glitchResult = applyGlitch(message, activeTerminal.logs);
        message = glitchResult.text;
      }
      
      const cancelTyping = typeTextWithSound(message, setDisplayedText, () => {
        setLogTypingComplete(true);
      }, { delay: 30 });
      typingRef.current = cancelTyping as any;
    } else {
      if (selectedLogData && selectedLogData.roll_check && selectedLogData.roll_check.on_failure) {
        const cancelTyping = typeTextWithSound(selectedLogData.roll_check.on_failure, setTerminalData);
        typingRef.current = cancelTyping as any;
      } else {
        const cancelTyping = typeTextWithSound("ACCESS DENIED. INSUFFICIENT CLEARANCE.", setTerminalData);
        typingRef.current = cancelTyping as any;
      }
      setSelectedLogData(null);
    }
    setSpecialRollCheck(null);
    setPasswordAttempts(0);
    setPasswordInput("");
  };

  // Navigation handlers
  const handleBackToTerminal = () => {
    setSelectedLogData(null);
    setDisplayedText("");
    setLogTypingComplete(false);
    setCurrentView("terminal");
    if (typingRef.current) {
      clearTimeout(typingRef.current);
      typingRef.current = null;
    }
  };

  const handleBackToInit = () => {
    setLogData(null);
    setActiveTerminal(null);
    setTerminalData("");
    setCurrentView("init");
    setTerminalPasswordRequired(false);
    setTerminalPasswordInput("");
    setTerminalPasswordAttempts(0);
    setRequiresPassword(false);
    setPasswordInput("");
    setPasswordAttempts(0);
    setSignalInterferenceLevel(0);
  };

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [displayedText, terminalData, logTypingComplete, currentView, commandOutput]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-mono mb-2">
            ██╗   ██╗ █████╗ ███╗   ██╗ █████╗  ██████╗  █████╗ ███╗   ██╗██████╗ ██████╗ 
          </h1>
          <h1 className="text-2xl font-mono mb-4">
            ██║   ██║██╔══██╗████╗  ██║██╔══██╗██╔════╝ ██╔══██╗████╗  ██║██╔══██╗██╔══██╗
          </h1>
          <h1 className="text-2xl font-mono mb-4">
            ██║   ██║███████║██╔██╗ ██║███████║██║  ███╗███████║██╔██╗ ██║██║  ██║██████╔╝
          </h1>
          <h1 className="text-2xl font-mono mb-4">
            ╚██╗ ██╔╝██╔══██║██║╚██╗██║██╔══██║██║   ██║██╔══██║██║╚██╗██║██║  ██║██╔══██╗
          </h1>
          <h1 className="text-2xl font-mono mb-4">
             ╚████╔╝ ██║  ██║██║ ╚████║██║  ██║╚██████╔╝██║  ██║██║ ╚████║██████╔╝██║  ██║
          </h1>
          <h1 className="text-2xl font-mono mb-4">
              ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝
          </h1>
        </div>
      </div>

      <SignalInterference 
        level={signalInterferenceLevel} 
        terminalType={activeTerminal ? 'corrupted' : 'normal'} 
      />

      <Card className="bg-card/60 border-primary/30">
        <CardContent className="p-6">
          <div 
            className={`${activeTerminal ? getTerminalEffectClasses(activeTerminal.logs) : "terminal terminal-flicker"} h-[400px] overflow-auto relative`}
            ref={terminalRef}
          >
            {/* Severe malfunction overlay */}
            {severeMalfunction && (
              <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
                <div className="text-red-500 font-mono text-lg border border-red-500 p-4">
                  {glitchText}
                </div>
              </div>
            )}

            {currentView === "init" && (
              <div className="font-mono text-sm whitespace-pre-wrap mb-4">
                {initText}
              </div>
            )}

            {/* Terminal password prompt */}
            {terminalPasswordRequired ? (
              <div className="p-4">
                <p className="mb-2">Terminal requires password authentication.</p>
                <p className="mb-4">Attempts remaining: {3 - terminalPasswordAttempts}</p>
                <div className="mt-4">
                  <Input
                    className="bg-background/20 border-primary/30 font-mono"
                    placeholder="Enter Password"
                    value={terminalPasswordInput}
                    onChange={(e) => setTerminalPasswordInput(e.target.value)}
                    type="password"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        // Handle password submission
                      }
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm">Submit</Button>
                    <Button variant="outline" size="sm" onClick={handleBackToInit}>Back</Button>
                  </div>
                </div>
              </div>
            ) : specialRollCheck ? (
              <div className="p-4">
                <p className="mb-4">
                  Did you pass the {specialRollCheck.difficulty}+ check for{" "}
                  {selectedLogData ? selectedLogData.title : "this file"}?
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleSpecialRollCheck(true)}>
                    Yes
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleSpecialRollCheck(false)}>
                    No
                  </Button>
                </div>
              </div>
            ) : rollCheck ? (
              <div className="p-4">
                <p className="mb-4">
                  Did you pass the {rollCheck.difficulty}+ Electronics (Computers) check?
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleRollCheck(true)}>
                    Yes
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleRollCheck(false)}>
                    No
                  </Button>
                </div>
              </div>
            ) : selectedLogData ? (
              <div className="p-4">
                <div className="whitespace-pre-wrap text-sm">{displayedText}</div>
                {logTypingComplete && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={handleBackToTerminal}>
                    Back
                  </Button>
                )}
              </div>
            ) : logData ? (
              <div className="p-4">
                {logData.map((log: any, index: number) => (
                  <p
                    key={index}
                    onClick={() => handleLogClick(log)}
                    className="cursor-pointer underline py-1 hover:text-primary/80"
                  >
                    {log.title}
                  </p>
                ))}
                <Button variant="outline" size="sm" className="mt-4" onClick={handleBackToInit}>
                  Back
                </Button>
              </div>
            ) : (
              <p className="p-4 text-sm">
                {terminalData || "ENTER ACCESS CODE TO PROCEED"}
              </p>
            )}
          </div>

          {/* Input section */}
          {currentView === "init" && (
            <div className="mt-4 flex gap-2">
              <Input
                className="bg-background/20 border-primary/30 font-mono flex-grow"
                placeholder="Enter Access Code..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAccessCode();
                  }
                }}
              />
              <Button variant="outline" onClick={() => handleAccessCode()}>
                Enter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}