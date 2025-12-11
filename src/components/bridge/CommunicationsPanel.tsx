import type { BridgeMessage } from "@/lib/bridge/bridgeTypes";

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
      <div className="comms-panel flex flex-col bg-[#0d1210] border border-[#1a2420] rounded overflow-hidden max-h-[400px]">
        <div className="panel-header flex justify-between items-center px-4 py-2 bg-[#00ff8808] border-b border-[#1a2420]">
          <span className="font-['Orbitron'] text-xs tracking-[3px] text-[#446655]">TRANSMISSION</span>
          <button
            onClick={onCloseMessage}
            className="text-[#446655] hover:text-[#00ff88] transition-colors"
          >
            CLOSE
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="mb-4 pb-3 border-b border-[#1a2420]">
            <div
              className={`font-bold text-sm mb-1 ${
                selectedMessage.priority === "emergency"
                  ? "text-[#ff4455]"
                  : selectedMessage.priority === "priority"
                    ? "text-[#ffaa00]"
                    : "text-[#00ff88]"
              }`}
            >
              FROM: {selectedMessage.sender}
            </div>
            <div className="text-xs text-[#446655]">
              RECEIVED: {timeAgo(selectedMessage.sentAt)} / PRIORITY: {selectedMessage.priority.toUpperCase()}
            </div>
          </div>

          {selectedMessage.encrypted ? (
            <div className="text-[#ff4455] font-mono">
              [ENCRYPTED - REQUIRES ELECTRONICS (COMPUTERS) {selectedMessage.encryptionDifficulty ?? 8}+ TO DECRYPT]
            </div>
          ) : (
            <div className="text-[#88bbaa] text-sm leading-relaxed whitespace-pre-wrap">
              {selectedMessage.content}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="comms-panel flex flex-col bg-[#0d1210] border border-[#1a2420] rounded overflow-hidden max-h-[400px]">
      <div className="panel-header flex justify-between items-center px-4 py-2 bg-[#00ff8808] border-b border-[#1a2420]">
        <span className="font-['Orbitron'] text-xs tracking-[3px] text-[#446655]">COMMUNICATIONS</span>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && <span className="text-xs text-[#ffaa00]">{unreadCount} UNREAD</span>}
          <button
            onClick={onComposeClick}
            className="text-xs text-[#00ff88] hover:text-white transition-colors"
          >
            + NEW
          </button>
        </div>
      </div>

      <div className="overflow-y-auto p-2 max-h-[280px]">
        {messages.length === 0 ? (
          <div className="text-center text-[#446655] text-sm py-8">NO TRANSMISSIONS</div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              onClick={() => onMessageClick(message)}
              className={`message p-3 mb-2 rounded cursor-pointer transition-all bg-[#00ff8808] border border-[#1a2420] hover:bg-[#00ff8815] hover:border-[#00aa55] ${
                message.priority === "emergency"
                  ? "border-l-[3px] border-l-[#ff4455]"
                  : message.priority === "priority"
                    ? "border-l-[3px] border-l-[#ffaa00]"
                    : !message.isRead
                      ? "border-l-[3px] border-l-[#00ff88]"
                      : ""
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`font-bold text-xs ${
                    message.priority === "emergency"
                      ? "text-[#ff4455]"
                      : message.priority === "priority"
                        ? "text-[#ffaa00]"
                        : "text-[#00ff88]"
                  }`}
                >
                  {message.sender}
                </span>
                <span className="text-[0.65rem] text-[#446655]">{timeAgo(message.sentAt)}</span>
              </div>
              <div className="text-xs text-[#88bbaa] line-clamp-2">
                {message.encrypted ? <span className="text-[#ff4455]">[ENCRYPTED]</span> : message.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
