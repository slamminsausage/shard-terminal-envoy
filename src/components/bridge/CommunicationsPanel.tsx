import { useState, useEffect, useRef } from "react";
import type { BridgeMessage } from "@/lib/bridge/bridgeTypes";
import audioManager from "@/lib/audioManager";

interface CommunicationsPanelProps {
  messages: BridgeMessage[];
  unreadCount: number;
  selectedMessage: BridgeMessage | null;
  onMessageClick: (message: BridgeMessage) => void;
  onComposeClick: () => void;
  onCloseMessage: () => void;
}

export function CommunicationsPanel({
  messages,
  unreadCount,
  selectedMessage,
  onMessageClick,
  onComposeClick,
  onCloseMessage
}: CommunicationsPanelProps) {
  const prevUnreadRef = useRef(unreadCount);
  const [incomingFlash, setIncomingFlash] = useState(false);

  useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      setIncomingFlash(true);
      audioManager.play('connection', 0.25);
      setTimeout(() => setIncomingFlash(false), 700);
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}D AGO`;
    if (diffHours > 0) return `${diffHours}H AGO`;
    if (diffMins > 0) return `${diffMins}M AGO`;
    return "JUST NOW";
  };

  if (selectedMessage) {
    return (
      <div className="comms-panel flex flex-col bg-terminal-bg-panel-alt border border-terminal-bg-border rounded overflow-hidden max-h-[400px]">
        <div className="panel-header flex justify-between items-center px-4 py-2 bg-terminal-primary-light/5 border-b border-terminal-bg-border">
          <span className="font-['Orbitron'] text-xs tracking-[3px] text-terminal-text-dimmer">TRANSMISSION</span>
          <button
            onClick={onCloseMessage}
            className="text-terminal-text-dimmer hover:text-terminal-primary-light transition-colors"
          >
            CLOSE
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="mb-4 pb-3 border-b border-terminal-bg-border">
            <div
              className={`font-bold text-sm mb-1 ${
                selectedMessage.priority === "emergency"
                  ? "text-terminal-danger-alt"
                  : selectedMessage.priority === "priority"
                    ? "text-terminal-warning-alt"
                    : "text-terminal-primary-light"
              }`}
            >
              FROM: {selectedMessage.sender}
            </div>
            <div className="text-xs text-terminal-text-dimmer">
              RECEIVED: {timeAgo(selectedMessage.sentAt)} / PRIORITY: {selectedMessage.priority.toUpperCase()}
            </div>
          </div>

          {selectedMessage.encrypted ? (
            <div className="text-terminal-danger-alt font-mono">
              [ENCRYPTED - REQUIRES ELECTRONICS (COMPUTERS) {selectedMessage.encryptionDifficulty ?? 8}+ TO DECRYPT]
            </div>
          ) : (
            <div className="text-terminal-text-muted text-sm leading-relaxed whitespace-pre-wrap">
              {selectedMessage.content}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`comms-panel flex flex-col bg-terminal-bg-panel-alt border border-terminal-bg-border rounded overflow-hidden max-h-[400px]${incomingFlash ? ' data-incoming-flash' : ''}`}>
      <div className="panel-header flex justify-between items-center px-4 py-2 bg-terminal-primary-light/5 border-b border-terminal-bg-border">
        <span className="font-['Orbitron'] text-xs tracking-[3px] text-terminal-text-dimmer">
          COMMUNICATIONS{incomingFlash && <span className="ml-2 text-terminal-primary animate-pulse">▶ INCOMING</span>}
        </span>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && <span className="text-xs text-terminal-warning-alt">{unreadCount} UNREAD</span>}
          <button
            onClick={onComposeClick}
            className="text-xs text-terminal-primary-light hover:text-white transition-colors"
          >
            + NEW
          </button>
        </div>
      </div>

      <div className="overflow-y-auto p-2 max-h-[280px]">
        {messages.length === 0 ? (
          <div className="text-center text-terminal-text-dimmer text-sm py-8">NO TRANSMISSIONS</div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              onClick={() => onMessageClick(message)}
              className={`message p-3 mb-2 rounded cursor-pointer transition-all bg-terminal-primary-light/5 border border-terminal-bg-border hover:bg-terminal-primary-light/10 hover:border-terminal-primary-mid ${
                message.priority === "emergency"
                  ? "border-l-[3px] border-l-terminal-danger-alt"
                  : message.priority === "priority"
                    ? "border-l-[3px] border-l-terminal-warning-alt"
                    : !message.isRead
                      ? "border-l-[3px] border-l-terminal-primary-light"
                      : ""
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`font-bold text-xs ${
                    message.priority === "emergency"
                      ? "text-terminal-danger-alt"
                      : message.priority === "priority"
                        ? "text-terminal-warning-alt"
                        : "text-terminal-primary-light"
                  }`}
                >
                  {message.sender}
                </span>
                <span className="text-[0.65rem] text-terminal-text-dimmer">{timeAgo(message.sentAt)}</span>
              </div>
              <div className="text-xs text-terminal-text-muted line-clamp-2">
                {message.encrypted ? <span className="text-terminal-danger-alt">[ENCRYPTED]</span> : message.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
