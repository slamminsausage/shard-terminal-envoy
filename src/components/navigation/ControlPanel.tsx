import { useJumpPlanner } from "@/contexts/JumpPlannerContext";
import { parseUWP, getZoneDescription } from "@/lib/travellerMapApi";
import { Loader2 } from "lucide-react";

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

  return (
    <div className="control-panel flex flex-col gap-3">
      {/* Error Display */}
      {error && (
        <div className="panel border-[#ff4455]">
          <div className="panel-content p-3 flex justify-between items-center">
            <span className="text-[#ff4455] text-sm">{error}</span>
            <button
              onClick={clearError}
              className="text-[#ff4455] hover:text-white text-xs"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* Jump Calculator */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">JUMP CALCULATOR</span>
        </div>
        <div className="panel-content space-y-3">
          {/* Jump Rating Selector */}
          <div className="flex items-center gap-3">
            <label className="text-[#446655] text-xs whitespace-nowrap">
              JUMP RATING:
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setJumpRating(rating)}
                  className={`w-8 h-8 border text-sm font-bold transition-all ${
                    jumpRating === rating
                      ? "border-primary bg-primary/20 text-primary shadow-[0_0_10px_rgba(0,255,0,0.4)]"
                      : "border-[#1a2420] text-[#446655] hover:border-primary/50"
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
              <div className="text-[#446655] text-xs mb-2">
                {jumpWorlds.length} WORLDS FOUND:
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {jumpWorlds.map((world) => {
                  const uwp = parseUWP(world.uwp);
                  const zoneClass =
                    world.zone === "A" || world.zone === "R"
                      ? "text-[#ffaa00]"
                      : world.zone === "F" || world.zone === "X"
                        ? "text-[#ff4455]"
                        : "text-primary";

                  return (
                    <button
                      key={`${world.sector}-${world.hex}`}
                      onClick={() => {
                        selectJumpWorld(world);
                        setCurrentLocation(world.sector, world.hex);
                      }}
                      className="w-full text-left p-2 border border-[#1a2420] hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`font-bold ${zoneClass}`}>
                            {world.name}
                          </span>
                          <span className="text-[#446655] text-xs ml-2">
                            {world.hex}
                          </span>
                        </div>
                        <span className="text-[#00ccff] text-xs font-mono">
                          {world.uwp}
                        </span>
                      </div>
                      {world.zone && (
                        <div className="text-xs text-[#446655] mt-1">
                          {getZoneDescription(world.zone)}
                        </div>
                      )}
                      <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRouteEndFromWorld(world);
                          }}
                          className="text-xs text-[#00ccff] hover:text-white"
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
      </div>

      {/* Route Planner */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">ROUTE PLANNER</span>
        </div>
        <div className="panel-content space-y-3">
          {/* Start Location */}
          <div>
            <label className="text-[#446655] text-xs block mb-1">
              START LOCATION:
            </label>
            <input
              type="text"
              value={routeStart}
              onChange={(e) => setRouteStart(e.target.value)}
              placeholder="e.g., Spinward Marches 1910"
              className="terminal-input text-sm"
            />
          </div>

          {/* End Location */}
          <div>
            <label className="text-[#446655] text-xs block mb-1">
              DESTINATION:
            </label>
            <input
              type="text"
              value={routeEnd}
              onChange={(e) => setRouteEnd(e.target.value)}
              placeholder="e.g., Spinward Marches 2230"
              className="terminal-input text-sm"
            />
          </div>

          {/* Route Options */}
          <div className="flex flex-wrap gap-3 text-xs">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={routeOptions.nored}
                onChange={(e) => setRouteOptions({ nored: e.target.checked })}
                className="accent-primary"
              />
              <span className="text-[#446655]">Avoid Red Zones</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={routeOptions.im}
                onChange={(e) => setRouteOptions({ im: e.target.checked })}
                className="accent-primary"
              />
              <span className="text-[#446655]">Imperium Only</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={routeOptions.wild}
                onChange={(e) => setRouteOptions({ wild: e.target.checked })}
                className="accent-primary"
              />
              <span className="text-[#446655]">Allow Wilderness</span>
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
              <div className="text-[#446655] text-xs mb-2">
                ROUTE ({route.length} JUMPS):
              </div>
              <div className="max-h-48 overflow-y-auto">
                <ol className="space-y-1">
                  {route.map((leg, idx) => (
                    <li
                      key={`${leg.sector}-${leg.hex}-${idx}`}
                      className="flex items-center gap-2 text-sm p-2 border-l-2 border-primary/30 pl-3"
                    >
                      <span className="text-[#00ccff] font-mono w-6">
                        {idx + 1}.
                      </span>
                      <button
                        onClick={() => setCurrentLocation(leg.sector, leg.hex)}
                        className="text-left flex-1 hover:text-primary transition-colors"
                      >
                        <span className="font-bold">{leg.name}</span>
                        <span className="text-[#446655] text-xs ml-2">
                          {leg.hex}
                        </span>
                        {leg.uwp && (
                          <span className="text-[#00ccff] text-xs ml-2 font-mono">
                            [{leg.uwp}]
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
