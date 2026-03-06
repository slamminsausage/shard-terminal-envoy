import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import audioManager from '../lib/audioManager';

// Authentication levels data
const authLevels = [
  {
    id: 1,
    title: "LEVEL 1 AUTHENTICATION",
    content: "DEEP CORE SECURITY - LEVEL 1\n\nVERSE I PASSPHRASE REQUIRED:",
    password: "SOMETHING",
    successMessage: "Level 1 Authentication successful.\nProceeding to Level 2...",
    failureMessage: "Authentication failed. Consult Verse I of the Deep Core Hymnal."
  },
  {
    id: 2,
    title: "LEVEL 2 AUTHENTICATION", 
    content: "DEEP CORE SECURITY - LEVEL 2\n\nVERSE II PASSPHRASE REQUIRED:",
    password: "PERFECT",
    successMessage: "Level 2 Authentication successful.\nProceeding to Level 3...",
    failureMessage: "Authentication failed. Consult Verse II of the Deep Core Hymnal."
  },
  {
    id: 3,
    title: "LEVEL 3 AUTHENTICATION",
    content: "DEEP CORE SECURITY - LEVEL 3\n\nVERSE III PASSPHRASE REQUIRED:",
    password: "BEHIND THE EYE",
    successMessage: "Level 3 Authentication successful.\nProceeding to Level 4...",
    failureMessage: "Authentication failed. Consult Verse III of the Deep Core Hymnal."
  },
  {
    id: 4,
    title: "LEVEL 4 AUTHENTICATION",
    content: "DEEP CORE SECURITY - LEVEL 4\n\nVERSE IV PASSPHRASE REQUIRED:",
    password: "MADE US",
    successMessage: "Final authentication successful.\n\nAccessing RIFTJAW DEEP CORE archives...",
    failureMessage: "Authentication failed. Consult Verse IV of the Deep Core Hymnal."
  }
];

// Add cinematic messages
const cinematicSequence = [
  { text: "> ACCESS CODE ACCEPTED", delay: 500 },
  { text: "> DEEP CORE HYMNAL - ALPHA SERIES", delay: 1000 },
  { text: "> UNLOCKING: PROTOCOL ∆-RIMWAKE01", delay: 1500 },
  { text: "\n", delay: 2000 },
  { text: "> WARNING: UNAUTHORIZED SIGNAL RESPONSE DETECTED", delay: 2500, warning: true },
  { text: "> UNKNOWN SYSTEM INTERLINK ACTIVATING...", delay: 3500, warning: true },
];

const systemInitSequence = [
  { text: "> SYSTEM ONLINE: RIFTJAW CORE ACCESS NODE ∆01", delay: 500 },
  { text: "> STATUS: DORMANT WAKE CYCLE INITIATED", delay: 1500 },
  { text: "> LINK CONFIRMED: FRAGMENT - SHARD/1/AZURE/MISSING", delay: 2500 },
  { text: "\n", delay: 3000 },
  { text: "CORE LOCK: DEEP SILO CAL-7", delay: 3500 },
  { text: "REACTION: NOTED", delay: 4500 },
  { text: "CYCLE: UNSTABLE", delay: 5000 },
];

const finalArchive = `RIFTJAW DEEP CORE ARCHIVE

Date: Approx. 20,000 Standard Years Ago  
Author: D. Kephar, Systems Architect – Builder Collective

[Translation from Builder Dialect – Accuracy: 97.3%]

To whomever finds this record:

What your people call "Riftjaw" is not a beast. It is not alive. But it was made to seem so to keep anyone and everyone away. Beneath your world lies a system—a machine built to hold something beyond understanding: a fragment of what we named the Eclipse Shard.

---

== HISTORICAL CONTEXT ==

Roughly 2 years ago, the fragment fell. We were not prepared. It collapsed networks, twisted neural code, and whispered into minds. It was not meant to be here.

It doesn't happen immediately, it takes time and we don't know what it really is....

We identified it as a dimensional interface—energy beyond spectrum or limit, possibly sentient. It could not be destroyed. So we built something to hold it.

---

== THE RIFTJAW COMPLEX ==

We called it the RIFTJAW Core (Resonant Integration Field & Temporal-Josephson Adaptive Waveform).

- CORE CHAMBER – A quantum suspension shell anchored beneath the planetary crust. When viewed from within, it resembles an eye. The mythologies that followed were inevitable.

- COOLING FINS – External strata laced with thermal bleed channels. They resemble scales in cross-section, purely functional.

- STABILIZATION MATRIX – A harmonic tunnel system designed to absorb psionic and temporal interference.

- MONITORING NODES – Self-regulating sensor hives that adjust environmental controls and isolate field distortions.

- ELECTROMAGNETIC SECURITY FIELD – Self-sustaining Electromagnetic containment field tuned exactly to the frequency of the Shard. Allows for passage to and from the Rim only with the Shard. 
Otherwise complete electrical failure of any device.

- OUTER SECURITY MEASURES – TL 15 security system stopping any intruders without Builder genetics, proper access codes, or the Shard itself.

---

== THE ECLIPSE SHARD ==

It is not of this galaxy. Possibly not of this reality. All signs point to Ancients technology.

What we know:

- Generates limitless energy when anchored  
- Alters time perception  
- Enhances psionic fields and cognitive reaction  
- Appears to record intent, not just action
- We know there is more to discover and working diligently to discover The Eclipse Shards secrets

Containment was mandatory. Interaction was reckless. But eventually, someone always wants more.

---

== LOG 17B – FINAL ENTRY ==

After long debate and risk, we built a **portable containment shell**.

The capsule uses a miniaturized version of the chamber's harmonic suspension—stable and indefinite **if powered**.

- Accepts starship-grade reactor feeds  
- Can regulate the fragment's influence in confined systems  
- Requires zero field reboots unless power is lost for >3.6 seconds  
- Fully shielded but not fully psionically inert—some interaction is inevitable

This device is buried in Vault A7. It is marked. It is locked. But if you are reading this… perhaps it is already gone.

---

Do not forget: The system will awaken when the balance is disturbed. The Rim will react. Lights will fail. Signals will pulse.

But not because something lives.  
Because something **remembers**.

Something perfect behind the eye made us.  
But it did not stay to guide us.

— D. Kephar  
[End of Archive]
`;

interface RiftjawTerminalProps {
  onBack?: () => void;
}

export default function RiftjawTerminal({ onBack }: RiftjawTerminalProps) {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordAttempts, setPasswordAttempts] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showFinalArchive, setShowFinalArchive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Cinematic state
  const [cinematicActive, setCinematicActive] = useState(false);
  const [cinematicText, setCinematicText] = useState("");
  const [environmentalEffects, setEnvironmentalEffects] = useState(false);
  const [blueCircuits, setBlueCircuits] = useState(false);
  const [systemInit, setSystemInit] = useState(false);
  const typingQueueRef = useRef([]);
  const isTypingRef = useRef(false);
  const timeoutIdsRef = useRef<number[]>([]);
  const isMountedRef = useRef(true);

  // Initialize audio
  useEffect(() => {
    isMountedRef.current = true;
    audioManager.preloadSounds();
    audioManager.playAmbient('terminal');

    return () => {
      isMountedRef.current = false;
      audioManager.stopAmbient();
      // Clean up all timeouts on unmount
      timeoutIdsRef.current.forEach(id => clearTimeout(id));
      timeoutIdsRef.current = [];
      // Clear typing queue
      typingQueueRef.current = [];
      isTypingRef.current = false;
    };
  }, []);

  // Play typing sound effect
  const playKeySound = () => {
    if (soundEnabled && Math.random() > 0.5) {
      audioManager.playEffect('keypress', 0.1);
    }
  };

  // Fixed typing function that queues messages
  const queueMessage = (text, callback) => {
    // Prevent race condition by using a lock
    const shouldProcess = typingQueueRef.current.length === 0 && !isTypingRef.current;
    typingQueueRef.current.push({ text, callback });
    if (shouldProcess) {
      processQueue();
    }
  };

  const processQueue = async () => {
    // Guard against concurrent execution or unmounted component
    if (!isMountedRef.current || isTypingRef.current || typingQueueRef.current.length === 0) return;

    isTypingRef.current = true;
    const { text, callback } = typingQueueRef.current.shift();

    // Type the message character by character
    for (let i = 0; i < text.length; i++) {
      if (!isMountedRef.current) {
        isTypingRef.current = false;
        return;
      }
      setCinematicText(prev => prev + text[i]);
      await new Promise(resolve => {
        const id = window.setTimeout(resolve, 30);
        timeoutIdsRef.current.push(id);
      });
    }

    if (!isMountedRef.current) {
      isTypingRef.current = false;
      return;
    }
    setCinematicText(prev => prev + "\n");

    if (callback) {
      await new Promise(resolve => {
        const id = window.setTimeout(resolve, 500);
        timeoutIdsRef.current.push(id);
      });
      if (isMountedRef.current) {
        callback();
      }
    }

    isTypingRef.current = false;

    // Process next message in queue if any
    if (isMountedRef.current && typingQueueRef.current.length > 0) {
      processQueue();
    }
  };

  // Run cinematic sequence
  const runCinematicSequence = async () => {
    setCinematicActive(true);
    setCinematicText("");
    typingQueueRef.current = [];
    isTypingRef.current = false;

    // Queue all cinematic messages with delays
    for (let i = 0; i < cinematicSequence.length; i++) {
      const msg = cinematicSequence[i];
      const timeoutId = window.setTimeout(() => {
        if (!isMountedRef.current) return;
        if (msg.warning) {
          audioManager.playEffect('warning', 0.3);
        }
        queueMessage(msg.text, undefined);
      }, msg.delay);
      timeoutIdsRef.current.push(timeoutId);
    }

    // Environmental effects
    const envTimeoutId = window.setTimeout(() => {
      if (!isMountedRef.current) return;
      setEnvironmentalEffects(true);
      audioManager.playEffect('glitch', 0.5);

      // Screen flicker
      document.body.style.animation = 'powerFlicker 2s ease-out';

      // Floor shudder effect
      const shudder1 = window.setTimeout(() => {
        if (!isMountedRef.current) return;
        document.body.style.transform = 'translateY(2px)';
        const shudder2 = window.setTimeout(() => {
          if (!isMountedRef.current) return;
          document.body.style.transform = 'translateY(-2px)';
          const shudder3 = window.setTimeout(() => {
            if (!isMountedRef.current) return;
            document.body.style.transform = 'translateY(0)';
          }, 100);
          timeoutIdsRef.current.push(shudder3);
        }, 100);
        timeoutIdsRef.current.push(shudder2);
      }, 500);
      timeoutIdsRef.current.push(shudder1);
    }, 8000);
    timeoutIdsRef.current.push(envTimeoutId);

    // Blue circuits activation
    const blueCircuitsId = window.setTimeout(() => {
      if (!isMountedRef.current) return;
      setBlueCircuits(true);
      audioManager.playEffect('corruption', 0.4);
    }, 10000);
    timeoutIdsRef.current.push(blueCircuitsId);

    // System initialization
    const systemInitId = window.setTimeout(() => {
      if (!isMountedRef.current) return;
      setCinematicText("");
      setSystemInit(true);
      audioManager.playAmbient('static');
      typingQueueRef.current = [];
      isTypingRef.current = false;

      // Queue system messages
      for (let i = 0; i < systemInitSequence.length; i++) {
        const msg = systemInitSequence[i];
        const msgTimeoutId = window.setTimeout(() => {
          if (!isMountedRef.current) return;
          queueMessage(msg.text, i === systemInitSequence.length - 1 ? () => {
            const finalId = window.setTimeout(() => {
              if (!isMountedRef.current) return;
              setCinematicActive(false);
              setShowFinalArchive(true);
            }, 2000);
            timeoutIdsRef.current.push(finalId);
          } : undefined);
        }, msg.delay);
        timeoutIdsRef.current.push(msgTimeoutId);
      }
    }, 12000);
    timeoutIdsRef.current.push(systemInitId);
  };

  const handlePasswordSubmit = () => {
    const level = authLevels[currentLevel];
    
    if (passwordInput === level.password) {
      // Correct password
      audioManager.playEffect('access_granted', 0.4);
      setShowSuccess(true);
      setSuccessMessage(level.successMessage);
      setPasswordInput("");
      setPasswordAttempts(0);
      setErrorMessage("");
      
      // Play level progression sound
      if (currentLevel < authLevels.length - 1) {
        audioManager.playEffect('keypress', 0.2);
      }

      // Auto-advance after 2 seconds
      const advanceId = window.setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage("");

        if (currentLevel < authLevels.length - 1) {
          setCurrentLevel(currentLevel + 1);
        } else {
          // Final level - start cinematic
          runCinematicSequence();
        }
      }, 2000);
      timeoutIdsRef.current.push(advanceId);
    } else {
      // Wrong password
      audioManager.playEffect('access_denied', 0.4);
      const attempts = passwordAttempts + 1;
      setPasswordAttempts(attempts);
      setPasswordInput("");

      if (attempts >= 3) {
        // Max attempts reached
        audioManager.playEffect('warning', 0.5);
        setErrorMessage("Maximum attempts exceeded. Access denied.");
        const navigateId = window.setTimeout(() => {
          navigate("/");
        }, 2000);
        timeoutIdsRef.current.push(navigateId);
      } else {
        // Show failure message
        setErrorMessage(`${level.failureMessage}\n\nAttempts remaining: ${3 - attempts}`);
      }
    }
  };

  // Cinematic screen
  if (cinematicActive) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-black p-4 relative overflow-hidden">
        {/* Environmental effects */}
        {environmentalEffects && (
          <>
            <div className="fixed inset-0 bg-blue-500 opacity-10 animate-pulse" />
            <motion.div 
              className="fixed inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              style={{
                background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 100, 255, 0.2) 50%, transparent 100%)'
              }}
            />
          </>
        )}
        
        {/* Blue circuits */}
        {blueCircuits && (
          <div className="fixed inset-0 pointer-events-none">
            <svg className="w-full h-full opacity-30">
              <motion.path
                d="M0,50 L100,50 L150,100 L250,100"
                stroke="#0080ff"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
              <motion.path
                d="M300,20 L350,20 L350,80 L400,80"
                stroke="#0080ff"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
              />
            </svg>
            <div className="absolute inset-0 bg-blue-500 opacity-5 animate-pulse" />
          </div>
        )}
        
        <Card className="w-full max-w-md lg:max-w-lg border-green-400 border-2 z-10">
          <CardContent className="p-4 sm:p-6">
            <div 
              className="terminal terminal-severe-flicker"
              style={{ 
                minHeight: "300px",
                maxHeight: "70vh",
                overflow: "auto",
                fontSize: "12px",
                color: systemInit ? "#00ffff" : "#33ff33",
                textShadow: systemInit ? "0 0 10px #00ffff" : "0 0 5px #33ff33"
              }}
            >
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
                {cinematicText}
                <span className="blinking-cursor">▌</span>
              </pre>
            </div>
          </CardContent>
        </Card>
        
        <style>{`
          @keyframes powerFlicker {
            0%, 100% { opacity: 1; filter: brightness(1); }
            10% { opacity: 0.8; filter: brightness(0.8); }
            20% { opacity: 1; filter: brightness(1.2); }
            30% { opacity: 0.7; filter: brightness(0.7); }
            40% { opacity: 1; filter: brightness(1); }
            50% { opacity: 0.6; filter: brightness(0.6); }
            60% { opacity: 1; filter: brightness(1); }
          }

          .terminal-severe-flicker {
            animation: severeFlicker 0.15s infinite alternate;
          }

          @keyframes severeFlicker {
            0% { opacity: 0.8; filter: brightness(0.8); }
            50% { opacity: 1; filter: brightness(1.1); }
            100% { opacity: 0.9; filter: brightness(0.9); }
          }
        `}</style>
      </div>
    );
  }

  // Show final archive
  if (showFinalArchive) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-black p-4">
        
        <Card className="w-full max-w-md lg:max-w-lg border-green-400 border-2">
          <CardContent className="p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
              <div 
                className="terminal terminal-flicker terminal-scanlines"
                style={{ 
                  overflow: "auto", 
                  minHeight: "300px",
                  maxHeight: "70vh",
                  position: "relative",
                  fontSize: "11px",
                  color: "#00ffff",
                  textShadow: "0 0 8px #00ffff"
                }}
              >
                <div style={{ whiteSpace: "pre-wrap", marginBottom: "10px" }}>
                  {finalArchive}
                </div>
                <Button
                  className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500 mt-2 w-full sm:w-auto"
                  onClick={() => {
                    audioManager.playEffect('keypress', 0.2);
                    if (onBack) {
                      onBack();
                    } else {
                      navigate("/");
                    }
                  }}
                >
                  Back to Terminal
                </Button>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show success message
  if (showSuccess) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-black p-4">
        <Card className="w-full max-w-md lg:max-w-lg border-green-400 border-2">
          <CardContent className="p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              <div 
                className="terminal terminal-flicker"
                style={{ 
                  overflow: "auto", 
                  height: "200px", 
                  position: "relative",
                  fontSize: "12px"
                }}
              >
                <div style={{ whiteSpace: "pre-wrap", marginBottom: "10px" }}>
                  {successMessage}
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main authentication screen
  const currentLevelData = authLevels[currentLevel];
  
  return (
    <div className="flex flex-col items-center min-h-screen bg-black p-4">
      
      <Card className="w-full max-w-md lg:max-w-lg border-green-400 border-2">
        <CardContent className="p-4 sm:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <div 
              className="terminal terminal-flicker"
              style={{ 
                overflow: "auto", 
                minHeight: "250px",
                position: "relative",
                fontSize: "12px"
              }}
            >
              {/* Level content */}
              <div style={{ whiteSpace: "pre-wrap", marginBottom: "15px" }}>
                {currentLevelData.title}
                {"\n\n"}
                Date: Unknown
                {"\n"}
                Author: Ancient Security System
                {"\n\n"}
                {currentLevelData.content}
              </div>
              
              {/* Error message */}
              {errorMessage && (
                <div style={{ color: '#ff6666', marginBottom: '10px', whiteSpace: 'pre-wrap' }}>
                  {errorMessage}
                </div>
              )}
              
              {/* Password input */}
              <div className="mt-2">
                <div style={{ marginBottom: '5px' }}>Enter Level {currentLevel + 1} Passphrase:</div>
                <Input
                  className="bg-black text-green-400 border border-green-400 px-3 py-2 font-mono focus:outline-none w-full"
                  placeholder="Enter Passphrase"
                  value={passwordInput}
                  onChange={(e) => {
                    playKeySound();
                    setPasswordInput(e.target.value);
                  }}
                  type="password"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handlePasswordSubmit();
                    }
                  }}
                />
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <Button
                    className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500 w-full sm:w-auto"
                    onClick={() => {
                      audioManager.playEffect('keypress', 0.2);
                      handlePasswordSubmit();
                    }}
                  >
                    Submit
                  </Button>
                  <Button
                    className="bg-green-400 text-black font-mono px-4 py-2 rounded hover:bg-green-500 w-full sm:w-auto"
              onClick={() => {
                audioManager.playEffect('keypress', 0.2);
                if (onBack) {
                  onBack();
                } else {
                  navigate("/");
                }
              }}
                  >
                    Back
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
