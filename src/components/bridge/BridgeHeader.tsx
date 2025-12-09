import { AlertLevel } from "@/lib/bridge/bridgeTypes";

interface BridgeHeaderProps {
  shipName?: string;
  alertLevel: AlertLevel;
}

const alertColors: Record<AlertLevel, string> = {
  normal: "text-primary",
  elevated: "text-warning",
  combat: "text-destructive",
  emergency: "text-red-500"
};

export function BridgeHeader({ shipName = "VANAGANDR", alertLevel }: BridgeHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-primary/30 bg-black/60">
      <div>
        <div className="text-xs font-mono tracking-[0.3em] text-primary/70">BRIDGE CONSOLE</div>
        <div className="text-lg font-mono tracking-[0.2em] text-primary">
          {shipName}
        </div>
      </div>
      <div className={`text-xs font-mono tracking-[0.2em] px-3 py-1 border rounded ${alertColors[alertLevel]}`}>
        ALERT: {alertLevel.toUpperCase()}
      </div>
    </div>
  );
}
