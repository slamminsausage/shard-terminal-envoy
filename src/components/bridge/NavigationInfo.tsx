interface NavigationInfoProps {
  currentSystem: string;
  destination?: string;
  eta?: string;
}

export function NavigationInfo({ currentSystem, destination, eta }: NavigationInfoProps) {
  return (
    <div className="mt-3 border border-primary/30 rounded bg-black/60 p-3 text-xs font-mono text-primary">
      <div className="flex items-center justify-between mb-1">
        <span className="tracking-[0.2em] text-primary/70">NAVIGATION</span>
        <span className="text-primary/60">{eta ? `ETA ${eta}` : "ETA N/A"}</span>
      </div>
      <div className="flex items-center gap-4">
        <div>
          <div className="text-primary/60">CURRENT</div>
          <div className="text-sm">{currentSystem}</div>
        </div>
        <div>
          <div className="text-primary/60">DESTINATION</div>
          <div className="text-sm">{destination || "---"}</div>
        </div>
      </div>
    </div>
  );
}
