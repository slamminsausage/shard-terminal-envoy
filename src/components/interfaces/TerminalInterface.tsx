import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SignalInterference from '../SignalInterference';
import audioManager from '@/lib/audioManager';
import { typeTextWithSound } from '@/lib/typing';
import { applyGlitch } from '@/lib/glitchText';
import { TERMINALS, getTerminalDefinition, type TerminalDefinition } from '@/lib/terminals';
import DeepCoreTerminal from '@/components/DeepCoreTerminal';

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
  const typingCancelRef = useRef<(() => void) | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  
  // Core state
  const [initText, setInitText] = useState("");
  const [initComplete, setInitComplete] = useState(false);
  const [currentView, setCurrentView] = useState("loading");
  const [inputCode, setInputCode] = useState("");
  const [terminalData, setTerminalData] = useState("");
  
  // Terminal state
  const [activeTerminal, setActiveTerminal] = useState<TerminalDefinition | null>(null);
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
  const [showDeepCoreTerminal, setShowDeepCoreTerminal] = useState(false);
  
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
        typingCancelRef.current = cancelTyping;
      }
    };
    displayNextMessage();
  }, []);

  // ESC key handler with two-step process
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Handle navigation based on current view
        if (currentView === "loading") {
          // Skip to init screen
          setCurrentView("init");
          setInitComplete(true);
          setInitText(">> THE TRAVELLER TERMINAL IS NOW ONLINE.\n");
          // Clean up any typing
          if (typingCancelRef.current) {
            typingCancelRef.current();
            typingCancelRef.current = null;
          }
        } else if (showAudioLogsPage) {
          // Handle ESC for audio logs page
          setShowAudioLogsPage(false);
          setAudioLogsData([]);
          setSelectedLogData(null);
          setCurrentView("terminal");
        } else if (currentView === "log" && selectedLogData) {
          // Two-step process for log view
          if (!logTypingComplete) {
            // First ESC: Complete typing immediately
            if (typingCancelRef.current) {
              typingCancelRef.current();
              typingCancelRef.current = null;
            }
            setLogTypingComplete(true);
            
            // Set the complete message immediately
            let message = `Date: ${selectedLogData.date}\nAuthor: ${selectedLogData.author}\n\n${selectedLogData.content || "No data available."}`;
            setDisplayedText(message);
          } else {
            // Second ESC: Go back to terminal view
            handleBackToTerminal();
          }
        } else if (currentView === "terminal" && (logData || activeTerminal)) {
          // Go back to init screen
          handleBackToInit();
          // Clean up any typing
          if (typingCancelRef.current) {
            typingCancelRef.current();
            typingCancelRef.current = null;
          }
        } else if (requiresPassword || terminalPasswordRequired || rollCheck || specialRollCheck) {
          // Clear any prompts and go back
          setRequiresPassword(false);
          setTerminalPasswordRequired(false);
          setRollCheck(null);
          setSpecialRollCheck(null);
          setPasswordInput("");
          setTerminalPasswordInput("");
          // Clean up typing
          if (typingCancelRef.current) {
            typingCancelRef.current();
            typingCancelRef.current = null;
          }
          handleBackToTerminal();
        }
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [currentView, selectedLogData, logData, activeTerminal, requiresPassword, terminalPasswordRequired, rollCheck, specialRollCheck, logTypingComplete, showAudioLogsPage]);

  // Handle access code
  const handleAccessCode = (codeOverride: string | null = null) => {
    const rawCode = typeof codeOverride === "string" ? codeOverride : inputCode;
    const trimmedCode = rawCode.trim();
    
    if (!trimmedCode) {
      audioManager.playEffect('access_denied', 0.4);
      const cancelTyping = typeTextWithSound("ACCESS DENIED. INVALID CODE.", setTerminalData);
      typingCancelRef.current = cancelTyping;
      setInputCode("");
      return;
    }
    
    const normalizedCode = trimmedCode.toLowerCase();
    
    const terminal = getTerminalDefinition(normalizedCode);
    if (terminal) {
      // Handle special Deep Core terminal
      if (terminal.requiresSpecialHandler && terminal.code === '01-1485-10-4-89-40') {
        setShowDeepCoreTerminal(true);
        return;
      }
      
      setActiveTerminal(terminal);
      setCurrentView("terminal");
      audioManager.playEffect('access_granted', 0.3);
      
      if (terminal.requiresPassword) {
        setTerminalPasswordRequired(true);
      } else if (terminal.requiresRoll) {
        setRollCheck({ difficulty: terminal.requiresRoll });
      } else {
        fetchLogs(terminal.logPath);
      }
    } else {
      audioManager.playEffect('access_denied', 0.4);
      const cancelTyping = typeTextWithSound("ACCESS DENIED. INVALID CODE.", setTerminalData);
      typingCancelRef.current = cancelTyping;
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
        
        const cancelTyping = typeTextWithSound(message, setDisplayedText, () => {
          setLogTypingComplete(true);
        }, { delay: 30 });
        typingCancelRef.current = cancelTyping;
      }
    } catch (error) {
      const cancelTyping = typeTextWithSound("ERROR LOADING LOGS.", setTerminalData);
      typingCancelRef.current = cancelTyping;
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
        

        const cancelTyping = typeTextWithSound(message, setDisplayedText, () => {
          setLogTypingComplete(true);
        }, { delay: 30 });
        typingCancelRef.current = cancelTyping;
      }
    }
  };

  // Terminal password handler
  const handleTerminalPasswordSubmit = () => {
    if (activeTerminal && activeTerminal.password && terminalPasswordInput === activeTerminal.password) {
      setTerminalPasswordRequired(false);
      setTerminalPasswordInput("");
      setTerminalPasswordAttempts(0);
      fetchLogs(activeTerminal.logPath);
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
          typingCancelRef.current = cancelTyping;
        } else {
          const cancelTyping = typeTextWithSound("ACCESS DENIED. MAXIMUM ATTEMPTS REACHED.", setTerminalData);
          typingCancelRef.current = cancelTyping;
          setTimeout(() => handleBackToInit(), 2000);
        }
      } else {
        audioManager.playEffect('access_denied', 0.4);
        const cancelTyping = typeTextWithSound(`ACCESS DENIED. INVALID PASSWORD. ${3 - attempts} attempts remaining.`, setTerminalData);
        typingCancelRef.current = cancelTyping;
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
        

        const cancelTyping = typeTextWithSound(message, setDisplayedText, () => {
          setLogTypingComplete(true);
        }, { delay: 30 });
        typingCancelRef.current = cancelTyping;
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
        typingCancelRef.current = cancelTyping;
      }
    }
  };

  // Roll check handler
  const handleRollCheck = (passed: boolean) => {
    if (passed) {
      audioManager.playEffect('access_granted', 0.3);
      if (activeTerminal) {
        fetchLogs(activeTerminal.logPath);
      } else {
        const cancelTyping = typeTextWithSound("ERROR: Terminal not found.", setTerminalData);
        typingCancelRef.current = cancelTyping;
      }
    } else {
      audioManager.playEffect('access_denied', 0.4);
      const cancelTyping = typeTextWithSound("ACCESS DENIED. INSUFFICIENT CLEARANCE.", setTerminalData);
      typingCancelRef.current = cancelTyping;
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
        
        
        
        const cancelTyping = typeTextWithSound(message, setDisplayedText, () => {
          setLogTypingComplete(true);
        }, { delay: 30 });
        typingCancelRef.current = cancelTyping;
      }
    } else {
      audioManager.playEffect('access_denied', 0.4);
      if (selectedLogData && selectedLogData.roll_check && selectedLogData.roll_check.on_failure) {
        const cancelTyping = typeTextWithSound(selectedLogData.roll_check.on_failure, setTerminalData);
        typingCancelRef.current = cancelTyping;
      } else {
        const cancelTyping = typeTextWithSound("ACCESS DENIED. INSUFFICIENT CLEARANCE.", setTerminalData);
        typingCancelRef.current = cancelTyping;
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
    if (typingCancelRef.current) {
      typingCancelRef.current();
      typingCancelRef.current = null;
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
    setShowDeepCoreTerminal(false);
  };

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [displayedText, terminalData, logTypingComplete, currentView, commandOutput]);

  // Show Deep Core Terminal if requested
  if (showDeepCoreTerminal) {
    return <DeepCoreTerminal onBack={() => setShowDeepCoreTerminal(false)} />;
  }

  // Audio logs page
  if (showAudioLogsPage) {
    return (
      <div className="h-screen bg-background p-6 flex flex-col crt-container">
        <div className="w-full flex flex-col h-full">
          <div className="text-center mb-6 flex-shrink-0">
            <h1 className="text-accent font-mono text-2xl terminal-glow mb-2">ENCRYPTED AUDIO LOGS</h1>
            <p className="text-primary/60 font-mono text-sm">Press ESC to return to terminal</p>
          </div>
          
          <div className="flex-1 min-h-0 bg-background/50 border border-primary/30 p-6">
            <ScrollArea className="h-full">
              <div className="space-y-8 pr-4 pb-24">
                {audioLogsData.map((log: any, index: number) => (
                  <div key={index} className="border-b border-primary/20 pb-6 last:border-b-0">
                    <h2 className="text-accent font-mono text-lg mb-3 terminal-glow">{log.title}</h2>
                    <p className="text-primary/90 font-mono text-sm whitespace-pre-wrap mb-4 leading-relaxed">{log.content}</p>
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
              </div>
            </ScrollArea>
          </div>
          
          <div className="flex-shrink-0 mt-6 p-4 border-t border-primary/30">
            <Button
              variant="terminal"
              onClick={() => {
                setShowAudioLogsPage(false);
                setAudioLogsData([]);
                setSelectedLogData(null);
                setCurrentView("terminal");
              }}
              className="w-full bg-primary/20 border-2 border-primary text-primary hover:bg-primary hover:text-background font-mono text-lg py-4 terminal-glow"
            >
              &gt; BACK TO TERMINAL
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background crt-container">
      <SignalInterference 
        level={signalInterferenceLevel} 
        terminalType={activeTerminal ? 'corrupted' : 'normal'} 
        soundEnabled={!audioManager.isMuted()}
      />
      
      {currentView === "loading" && (
        <div className="flex items-center justify-center h-full px-4">
          <div className="terminal-text terminal-glow text-accent font-mono text-sm whitespace-pre-wrap text-center">
            {initText}
            <div className="text-xs text-primary/60 mt-4">Press ESC to skip</div>
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
                <div className="text-xs text-primary/60 mt-2">Press ESC to navigate back</div>
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
              <div className="grid grid-cols-6 gap-4 text-primary font-mono text-xs">
                {TERMINALS.map((terminal, index) => (
                  <div 
                    key={terminal.code}
                    className="border border-primary/30 p-2 cursor-pointer hover:text-accent hover:border-accent/50 transition-colors"
                    onClick={() => setInputCode(terminal.code)}
                    title={terminal.name}
                  >
                    <div className="truncate">{terminal.code}</div>
                    <div className="text-primary/60 text-xs truncate">{terminal.name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {(currentView === "terminal" || currentView === "log") && (
        <div className="h-full p-8">
          <div 
            className={`${activeTerminal ? getTerminalEffectClasses(activeTerminal.logPath) : "terminal terminal-flicker"} h-full overflow-auto relative bg-background/20 border border-primary/30 p-6`}
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
                <div className="space-y-2">
                  {logData.map((log: any, index: number) => (
                    <div
                      key={index}
                      onClick={() => handleLogClick(log)}
                      className="border border-primary/50 bg-primary/10 p-3 cursor-pointer hover:bg-primary/20 hover:border-accent transition-colors font-mono text-sm"
                    >
                      {log.title}
                    </div>
                  ))}
                </div>
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
        </div>
      )}

      {/* Sound Toggle Button - Bottom Right */}
      <div className="fixed bottom-4 right-4 z-50">
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
    </div>
  );
}