import { useState, useEffect, useRef } from "react";
import { useJumpPlanner } from "@/contexts/JumpPlannerContext";
import { parseUWP, getZoneDescription, type WorldSearchResult } from "@/lib/travellerMapApi";
import { WorldSearchAutocomplete } from "./WorldSearchAutocomplete";
import { AccordionPanel } from "./AccordionPanel";
import { Loader2, Zap } from "lucide-react";

export function ControlPanel() {
  const {
    currentLocation,
    jumpRating,
    jumpWorlds,
    isLoadingJumpWorlds,
    routeStart,
    routeEnd,
    route,
    isLoadingRoute,
    routeOptions,
    error,
    setJumpRating,
    loadJumpWorlds,
    selectJumpWorld,
    setRouteStart,
    setRouteEnd,
    setRouteOptions,
    setRouteEndFromWorld,
    planRoute,
    setCurrentLocation,
    clearError,
  } = useJumpPlanner();

  // Route animation: increment key whenever route changes to re-trigger CSS animations
  const [routeAnimKey, setRouteAnimKey] = useState(0);
  const prevRouteLen = useRef(0);
  useEffect(() => {
    if (route.length !== prevRouteLen.current) {
      if (route.length > 0) setRouteAnimKey(k => k + 1);
      prevRouteLen.current = route.length;
    }
  }, [route]);

  // Jump countdown state
  const [jumpCountdown, setJumpCountdown] = useState<number | null>(null);
  const [jumpComplete, setJumpComplete] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startJumpCountdown = () => {
    setJumpComplete(false);
    setJumpCountdown(5);
    countdownRef.current = setInterval(() => {
      setJumpCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownRef.current!);
          setJumpCountdown(null);
          setJumpComplete(true);
          setTimeout(() => setJumpComplete(false), 3000);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="control-panel flex flex-col gap-3 flex-shrink-0">
      {/* Error Display */}
      {error && (
        <div className="panel border-terminal-danger-alt">
          <div className="panel-content p-3 flex justify-between items-center">
            <span className="text-terminal-danger-alt text-sm">{error}</span>
            <button
              onClick={clearError}
              className="text-terminal-danger-alt hover:text-white text-xs"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* Jump Calculator */}
      <AccordionPanel
        title="JUMP CALCULATOR"
        defaultExpanded={true}
      >
        {/* Jump Rating Selector */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <label className="text-terminal-text-dimmer text-xs whitespace-nowrap">
              JUMP RATING:
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setJumpRating(rating)}
                  className={`w-8 h-8 border text-sm font-bold transition-all ${
                    jumpRating === rating
                      ? "border-primary bg-primary/20 text-primary shadow-[0_0_10px_rgba(58, 226, 179,0.4)]"
                      : "border-terminal-bg-border text-terminal-text-dimmer hover:border-primary/50"
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={loadJumpWorlds}
            disabled={!currentLocation || isLoadingJumpWorlds}
            className="terminal-btn w-full flex items-center justify-center gap-2"
          >
            {isLoadingJumpWorlds ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                SCANNING...
              </>
            ) : (
              `FIND WORLDS WITHIN JUMP-${jumpRating}`
            )}
          </button>

          {/* Jump Worlds List */}
          {jumpWorlds.length > 0 && (
            <div className="mt-3">
              <div className="text-terminal-text-dimmer text-xs mb-2">
                {jumpWorlds.length} WORLDS FOUND:
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {jumpWorlds.map((world) => {
                  const uwp = parseUWP(world.uwp);
                  const zoneClass =
                    world.zone === "A" || world.zone === "R"
                      ? "text-terminal-warning-alt"
                      : world.zone === "F" || world.zone === "X"
                        ? "text-terminal-danger-alt"
                        : "text-primary";

                  return (
                    <button
                      key={`${world.sector}-${world.hex}`}
                      onClick={() => {
                        selectJumpWorld(world);
                        setCurrentLocation(world.sector, world.hex);
                      }}
                      className="w-full text-left p-2 border border-terminal-bg-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`font-bold ${zoneClass}`}>
                            {world.name}
                          </span>
                          <span className="text-terminal-text-dimmer text-xs ml-2">
                            {world.hex}
                          </span>
                        </div>
                        <span className="text-terminal-secondary text-xs font-mono">
                          {world.uwp}
                        </span>
                      </div>
                      {world.zone && (
                        <div className="text-xs text-terminal-text-dimmer mt-1">
                          {getZoneDescription(world.zone)}
                        </div>
                      )}
                      <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRouteEndFromWorld(world);
                          }}
                          className="text-xs text-terminal-secondary hover:text-white"
                        >
                          [SET AS DESTINATION]
                        </button>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </AccordionPanel>

      {/* Route Planner */}
      <AccordionPanel
        title="ROUTE PLANNER"
        defaultExpanded={false}
      >
        <div className="space-y-3">
          {/* Start Location */}
          <WorldSearchAutocomplete
            label="START LOCATION:"
            value={routeStart}
            onChange={setRouteStart}
            onSelect={(result: WorldSearchResult) => {
              if (result.type === "world") {
                setRouteStart(`${result.sector} ${result.hex}`);
              }
            }}
            placeholder="Search or type: Trojan Reach 2223"
          />

          {/* End Location */}
          <WorldSearchAutocomplete
            label="DESTINATION:"
            value={routeEnd}
            onChange={setRouteEnd}
            onSelect={(result: WorldSearchResult) => {
              if (result.type === "world") {
                setRouteEnd(`${result.sector} ${result.hex}`);
              }
            }}
            placeholder="Search or type: Trojan Reach 3201"
          />

          {/* Route Options */}
          <div className="flex flex-wrap gap-3 text-xs">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={routeOptions.nored}
                onChange={(e) => setRouteOptions({ nored: e.target.checked })}
                className="accent-primary"
              />
              <span className="text-terminal-text-dimmer">Avoid Red Zones</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={routeOptions.im}
                onChange={(e) => setRouteOptions({ im: e.target.checked })}
                className="accent-primary"
              />
              <span className="text-terminal-text-dimmer">Imperium Only</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={routeOptions.wild}
                onChange={(e) => setRouteOptions({ wild: e.target.checked })}
                className="accent-primary"
              />
              <span className="text-terminal-text-dimmer">Allow Wilderness</span>
            </label>
          </div>

          {/* Plan Route Button */}
          <button
            onClick={planRoute}
            disabled={!routeStart || !routeEnd || isLoadingRoute}
            className="terminal-btn secondary w-full flex items-center justify-center gap-2"
          >
            {isLoadingRoute ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                CALCULATING...
              </>
            ) : (
              "CALCULATE ROUTE"
            )}
          </button>

          {/* Route Results */}
          {route.length > 0 && (
            <div className="mt-3">
              <div className="text-terminal-text-dimmer text-xs mb-2">
                ROUTE ({route.length} waypoints, {Math.max(0, route.length - 1)} jump{route.length === 2 ? '' : 's'}):
              </div>
              <div className="max-h-48 overflow-y-auto">
                <ol className="space-y-1" key={routeAnimKey}>
                  {route.map((leg, idx) => (
                    <li
                      key={`${leg.sector}-${leg.hex}-${idx}`}
                      className="route-leg-enter flex items-center gap-2 text-sm p-2 border-l-2 border-primary/30 pl-3"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <span className="text-terminal-secondary font-mono w-6">
                        {idx + 1}.
                      </span>
                      <button
                        onClick={() => setCurrentLocation(leg.sector, leg.hex)}
                        className="text-left flex-1 hover:text-primary transition-colors"
                      >
                        <span className="font-bold">{leg.name}</span>
                        <span className="text-terminal-text-dimmer text-xs ml-2">
                          {leg.hex}
                        </span>
                        {leg.uwp && (
                          <span className="text-terminal-secondary text-xs ml-2 font-mono">
                            [{leg.uwp}]
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Initiate Jump button */}
              {jumpCountdown === null && !jumpComplete && (
                <button
                  onClick={startJumpCountdown}
                  className="mt-3 w-full terminal-btn flex items-center justify-center gap-2 bg-primary/10 border-primary/60 hover:bg-primary/20 hover:shadow-[0_0_12px_rgba(58, 226, 179,0.3)] transition-all"
                >
                  <Zap className="w-4 h-4" />
                  INITIATE JUMP
                </button>
              )}
            </div>
          )}

          {/* Jump countdown overlay */}
          {(jumpCountdown !== null || jumpComplete) && (
            <div className="mt-3 border border-primary/60 rounded p-4 text-center bg-black/60">
              {jumpComplete ? (
                <div className="terminal-severe-flicker">
                  <div className="text-primary font-['Orbitron'] text-lg tracking-[4px] font-bold">JUMP ENGAGED</div>
                  <div className="text-primary/60 text-xs mt-1 tracking-wider">TRANSITIONING TO JUMP SPACE</div>
                </div>
              ) : (
                <>
                  <div className="text-terminal-text-dimmer text-xs tracking-widest mb-2 uppercase">Jump Countdown</div>
                  <div
                    className={`font-['Orbitron'] font-bold text-5xl tracking-widest text-primary ${
                      jumpCountdown! <= 2 ? 'jump-countdown-high' : 'jump-countdown-low'
                    }`}
                    style={{ textShadow: `0 0 ${10 + (5 - (jumpCountdown ?? 5)) * 8}px rgba(51,255,102,0.8)` }}
                  >
                    {jumpCountdown}
                  </div>
                  <div className="text-terminal-text-dimmer text-[0.6rem] mt-2 tracking-widest">
                    {jumpCountdown! > 3 ? 'SPOOLING JUMP DRIVE...' : jumpCountdown! > 1 ? 'FIELD COHERENCE NOMINAL' : 'JUMP IMMINENT'}
                  </div>
                  <button
                    onClick={() => { clearInterval(countdownRef.current!); setJumpCountdown(null); }}
                    className="mt-3 text-xs text-terminal-text-dimmer hover:text-red-400 transition-colors"
                  >
                    [ABORT]
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </AccordionPanel>
    </div>
  );
}
