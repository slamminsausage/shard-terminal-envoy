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
  const [currentView, setCurrentView] = useState("loading");
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

  // Initialize terminal and audio
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    // Initialize audio manager
    audioManager.preloadSounds();
    
    const loadingMessages = [
      ">> INITIALIZING TRAVELLER TERMINAL MAINFRAME SUBSYSTEMS...",
      ">> ESTABLISHING SECURE UPLINK TO ARCHIVAL NETWORKS...",
      ">> CALIBRATING REALITY ANCHORS AND SCIENTIFIC FILTERS...",
      ">> AUTHENTICATING ACCESS PROTOCOLS...",
      ">> THE TRAVELLER TERMINAL IS NOW ONLINE."
    ];
    
    let i = 0;
    const displayNextMessage = () => {
      if (i < loadingMessages.length) {
        const cancelTyping = typeTextWithSound(loadingMessages[i] + "\n", setInitText, () => {
          i++;
          if (i < loadingMessages.length) {
            setTimeout(displayNextMessage, 800);
          } else {
            setTimeout(() => {
              setCurrentView("init");
              setInitComplete(true);
            }, 1000);
          }
        }, { delay: 30 });
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
      audioManager.playEffect('access_denied', 0.4);
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
      audioManager.playEffect('access_granted', 0.3);
      
      if (terminal.requiresPassword) {
        setTerminalPasswordRequired(true);
      } else if (terminal.requiresRoll) {
        setRollCheck({ difficulty: terminal.requiresRoll });
      } else {
        fetchLogs(terminal.logs);
      }
    } else {
      audioManager.playEffect('access_denied', 0.4);
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
    
    if (log.logs) {
      if (log.requires_password) {
        setRequiresPassword(true);
      } else {
        setAudioLogsData(log.logs);
        setShowAudioLogsPage(true);
      }
    } else if (log.requires_password) {
      setRequiresPassword(true);
    } else {
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
    }
  };

  // Terminal password handler
  const handleTerminalPasswordSubmit = () => {
    if (activeTerminal && activeTerminal.password && terminalPasswordInput === activeTerminal.password) {
      setTerminalPasswordRequired(false);
      setTerminalPasswordInput("");
      setTerminalPasswordAttempts(0);
      fetchLogs(activeTerminal.logs);
      audioManager.playEffect('access_granted', 0.3);
    } else {
      const attempts = terminalPasswordAttempts + 1;
      setTerminalPasswordAttempts(attempts);
      setTerminalPasswordInput("");
      
      if (attempts >= 3) {
        setTerminalPasswordRequired(false);
        
        if (activeTerminal && activeTerminal.requiresRoll) {
          setRollCheck({ difficulty: activeTerminal.requiresRoll });
          const cancelTyping = typeTextWithSound("Maximum password attempts reached. Attempting alternate access method...", setTerminalData);
          typingRef.current = cancelTyping as any;
        } else {
          const cancelTyping = typeTextWithSound("ACCESS DENIED. MAXIMUM ATTEMPTS REACHED.", setTerminalData);
          typingRef.current = cancelTyping as any;
          setTimeout(() => handleBackToInit(), 2000);
        }
      } else {
        audioManager.playEffect('access_denied', 0.4);
        const cancelTyping = typeTextWithSound(`ACCESS DENIED. INVALID PASSWORD. ${3 - attempts} attempts remaining.`, setTerminalData);
        typingRef.current = cancelTyping as any;
      }
    }
  };

  // Password submit handler for log passwords
  const handlePasswordSubmit = () => {
    if (selectedLogData && passwordInput === selectedLogData.password) {
      setRequiresPassword(false);
      setPasswordInput("");
      setPasswordAttempts(0);
      
      if (selectedLogData.logs) {
        setAudioLogsData(selectedLogData.logs);
        setShowAudioLogsPage(true);
      } else {
        setDisplayedText("");
        setLogTypingComplete(false);
        
        let message = `Date: ${selectedLogData.date}\nAuthor: ${selectedLogData.author}\n\n${selectedLogData.content}`;
        
        if (activeTerminal) {
          const glitchResult = applyGlitch(message, activeTerminal.logs);
          message = glitchResult.text;
        }

        const cancelTyping = typeTextWithSound(message, setDisplayedText, () => {
          setLogTypingComplete(true);
        }, { delay: 30 });
        typingRef.current = cancelTyping as any;
      }
      audioManager.playEffect('access_granted', 0.3);
    } else {
      const attempts = passwordAttempts + 1;
      setPasswordAttempts(attempts);
      setPasswordInput("");
      
      if (attempts >= (selectedLogData?.attemptsAllowed || 3)) {
        setRequiresPassword(false);
        if (selectedLogData?.roll_check) {
          setSpecialRollCheck({ difficulty: selectedLogData.roll_check.difficulty });
        }
      } else {
        audioManager.playEffect('access_denied', 0.4);
        const cancelTyping = typeTextWithSound("Incorrect password. Please try again.", setTerminalData);
        typingRef.current = cancelTyping as any;
      }
    }
  };

  // Roll check handler
  const handleRollCheck = (passed: boolean) => {
    if (passed) {
      audioManager.playEffect('access_granted', 0.3);
      if (activeTerminal) {
        fetchLogs(activeTerminal.logs);
      } else {
        const cancelTyping = typeTextWithSound("ERROR: Terminal not found.", setTerminalData);
        typingRef.current = cancelTyping as any;
      }
    } else {
      audioManager.playEffect('access_denied', 0.4);
      const cancelTyping = typeTextWithSound("ACCESS DENIED. INSUFFICIENT CLEARANCE.", setTerminalData);
      typingRef.current = cancelTyping as any;
    }
    setRollCheck(null);
  };

  // Special roll check handler
  const handleSpecialRollCheck = (passed: boolean) => {
    if (passed && selectedLogData) {
      audioManager.playEffect('access_granted', 0.3);
      
      if (selectedLogData.logs) {
        setAudioLogsData(selectedLogData.logs);
        setShowAudioLogsPage(true);
      } else {
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
      }
    } else {
      audioManager.playEffect('access_denied', 0.4);
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

  // Audio logs page
  if (showAudioLogsPage) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-accent font-mono text-xl terminal-glow">Encrypted Audio Logs</h1>
          </div>
          <Card className="bg-card border-primary/30">
            <CardContent className="p-6">
              <div className="space-y-6">
                {audioLogsData.map((log: any, index: number) => (
                  <div key={index} className="border-b border-primary/20 pb-4 last:border-b-0">
                    <h2 className="text-primary font-mono text-lg mb-2">{log.title}</h2>
                    <p className="text-primary/80 font-mono text-sm whitespace-pre-wrap mb-3">{log.content}</p>
                    {log.audio_file && (
                      <audio
                        controls
                        className="w-full"
                        style={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--primary))",
                          borderRadius: "5px"
                        }}
                      >
                        <source src={log.audio_file} type="audio/mp3" />
                        Your browser does not support the audio element.
                      </audio>
                    )}
                  </div>
                ))}
                <Button
                  variant="terminal"
                  onClick={() => {
                    setShowAudioLogsPage(false);
                    setAudioLogsData([]);
                    setSelectedLogData(null);
                    setCurrentView("terminal");
                  }}
                  className="w-full"
                >
                  Back to Terminal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background crt-container p-4">
      {/* Sound Toggle Button */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const isMuted = audioManager.toggleMute();
            // Visual feedback could be added here
          }}
          className="font-mono"
        >
          {audioManager.isMuted() ? '🔇' : '🔊'}
        </Button>
      </div>

      <SignalInterference 
        level={signalInterferenceLevel} 
        terminalType={activeTerminal ? 'corrupted' : 'normal'} 
        soundEnabled={!audioManager.isMuted()}
      />

      {currentView === "loading" && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="terminal-text terminal-glow text-accent font-mono text-sm whitespace-pre-wrap text-center">
            {initText}
          </div>
        </div>
      )}

      {currentView === "init" && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main Terminal Input */}
          <Card className="bg-card border-primary/30 terminal-window">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="text-accent font-mono text-lg mb-2 terminal-glow">
                  &gt;_ TRAVELLER TERMINAL
                </div>
                <div className="text-primary font-mono text-sm">
                  ENTER ACCESS CODE
                </div>
              </div>
              
              <div className="flex gap-2 mb-4">
                <Input
                  className="bg-background border-primary/50 text-primary font-mono flex-grow"
                  placeholder="Terminal Access Code..."
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAccessCode();
                    }
                  }}
                />
                <Button variant="terminal" onClick={() => handleAccessCode()}>
                  CONNECT
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Available Terminals */}
          <Card className="bg-card border-primary/30 terminal-window">
            <CardContent className="p-6">
              <div className="text-primary/80 font-mono text-sm mb-4">AVAILABLE TERMINALS:</div>
              <div className="grid grid-cols-3 gap-4 text-primary font-mono text-xs">
                <div className="space-y-1">
                  <div className="cursor-pointer hover:text-accent" onClick={() => setInputCode("lysani01")}>lysani01</div>
                  <div className="cursor-pointer hover:text-accent" onClick={() => setInputCode("s.elara01")}>s.elara01</div>
                  <div className="cursor-pointer hover:text-accent" onClick={() => setInputCode("waferterm01")}>waferterm01</div>
                  <div className="cursor-pointer hover:text-accent" onClick={() => setInputCode("blackcircuit01")}>blackcircuit01</div>
                  <div className="cursor-pointer hover:text-accent" onClick={() => setInputCode("vennik01")}>vennik01</div>
                  <div className="cursor-pointer hover:text-accent" onClick={() => setInputCode("blacktalon")}>blacktalon</div>
                </div>
                <div className="space-y-1">
                  <div className="cursor-pointer hover:text-accent" onClick={() => setInputCode("labpc81")}>labpc81</div>
                  <div className="cursor-pointer hover:text-accent" onClick={() => setInputCode("fuw01")}>fuw01</div>
                  <div className="cursor-pointer hover:text-accent" onClick={() => setInputCode("caldonis_public")}>caldonis_public</div>
                  <div className="cursor-pointer hover:text-accent" onClick={() => setInputCode("vennik-personal")}>vennik-personal</div>
                  <div className="cursor-pointer hover:text-accent" onClick={() => setInputCode("fuwnet")}>fuwnet</div>
                </div>
                <div className="space-y-1">
                  <div className="cursor-pointer hover:text-accent" onClick={() => setInputCode("slocombe875")}>slocombe875</div>
                  <div className="cursor-pointer hover:text-accent" onClick={() => setInputCode("vanagandr001")}>vanagandr001</div>
                  <div className="cursor-pointer hover:text-accent" onClick={() => setInputCode("azura01")}>azura01</div>
                  <div className="cursor-pointer hover:text-accent" onClick={() => setInputCode("blacksite-es1")}>blacksite-es1</div>
                  <div className="cursor-pointer hover:text-accent" onClick={() => setInputCode("sayelle-logs")}>sayelle-logs</div>
                  <div className="cursor-pointer hover:text-accent" onClick={() => setInputCode("01-1485-10-4-89-40")}>01-1485-10-4-89-40</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {(currentView === "terminal" || currentView === "log") && (
        <Card className="bg-card border-primary/30 terminal-window max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div 
              className={`${activeTerminal ? getTerminalEffectClasses(activeTerminal.logs) : "terminal terminal-flicker"} h-[400px] overflow-auto relative`}
              ref={terminalRef}
            >
              {/* Severe malfunction overlay */}
              {severeMalfunction && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
                  <div className="text-destructive font-mono text-lg border border-destructive p-4">
                    {glitchText}
                  </div>
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
                          handleTerminalPasswordSubmit();
                        }
                      }}
                    />
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={handleTerminalPasswordSubmit}>Submit</Button>
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
            ) : selectedLogData && requiresPassword ? (
              <div className="p-4">
                <div className="whitespace-pre-wrap text-sm mb-4">{displayedText}</div>
                <p className="mb-2 text-sm">
                  Password required. Attempts remaining:{" "}
                  {(selectedLogData.attemptsAllowed || 3) - passwordAttempts}
                </p>
                <Input
                  className="bg-background/20 border-primary/30 font-mono mb-2"
                  placeholder="Enter Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  type="password"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handlePasswordSubmit();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePasswordSubmit}>Submit</Button>
                  <Button variant="outline" size="sm" onClick={handleBackToTerminal}>Back</Button>
                </div>
              </div>
            ) : selectedLogData ? (
              <div className="p-4">
                <div className="whitespace-pre-wrap text-sm">{displayedText}</div>
                {selectedLogData.audio_file && (
                  <audio
                    controls
                    className="w-full mt-2"
                    style={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--primary))",
                      borderRadius: "5px",
                      color: "hsl(var(--primary))"
                    }}
                  >
                    <source src={selectedLogData.audio_file} type="audio/mp3" />
                    Your browser does not support the audio element.
                  </audio>
                )}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}