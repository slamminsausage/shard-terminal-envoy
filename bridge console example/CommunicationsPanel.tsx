// src/components/bridge/CommunicationsPanel.tsx
// Communications/Messages panel with improved visibility

import type { BridgeMessage } from '@/lib/bridge/bridgeTypes';

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
  onCloseMessage,
}: CommunicationsPanelProps) {
  // Format time ago
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
    return 'JUST NOW';
  };

  // If a message is selected, show full view
  if (selectedMessage) {
    return (
      <div className="comms-panel flex-1 flex flex-col bg-[#0d1210] border border-[#1a2420] rounded overflow-hidden min-h-[200px]">
        {/* Header */}
        <div className="panel-header flex justify-between items-center px-4 py-2 bg-[#00ff8808] border-b border-[#1a2420]">
          <span className="font-['Orbitron'] text-xs tracking-[3px] text-[#446655]">TRANSMISSION</span>
          <button
            onClick={onCloseMessage}
            className="text-[#446655] hover:text-[#00ff88] transition-colors"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Full Message */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="mb-4 pb-3 border-b border-[#1a2420]">
            <div className={`font-bold text-sm mb-1 ${
              selectedMessage.priority === 'emergency' ? 'text-[#ff4455]' :
              selectedMessage.priority === 'priority' ? 'text-[#ffaa00]' : 'text-[#00ff88]'
            }`}>
              FROM: {selectedMessage.sender}
            </div>
            <div className="text-xs text-[#446655]">
              RECEIVED: {timeAgo(selectedMessage.sent_at)} • 
              PRIORITY: {selectedMessage.priority.toUpperCase()}
            </div>
          </div>
          
          {selectedMessage.encrypted ? (
            <div className="text-[#ff4455] font-mono">
              [ENCRYPTED - REQUIRES ELECTRONICS (COMPUTERS) {selectedMessage.encryption_difficulty}+ TO DECRYPT]
              <div className="mt-2 opacity-50">
                ●●●●●● ●●●●●●● ●●●●●● ●●●● ●●●●●●● ●●●●●● ●●●●
                ●●● ●●●●●●● ●●●●●● ●●●● ●●●●●●● ●●●●●● ●●●●●●
              </div>
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

  // Message list view
  return (
    <div className="comms-panel flex-1 flex flex-col bg-[#0d1210] border border-[#1a2420] rounded overflow-hidden min-h-[200px]">
      {/* Header */}
      <div className="panel-header flex justify-between items-center px-4 py-2 bg-[#00ff8808] border-b border-[#1a2420]">
        <span className="font-['Orbitron'] text-xs tracking-[3px] text-[#446655]">COMMUNICATIONS</span>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="text-xs text-[#ffaa00]">{unreadCount} UNREAD</span>
          )}
          <button
            onClick={onComposeClick}
            className="text-xs text-[#00ff88] hover:text-white transition-colors"
          >
            + NEW
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-2">
        {messages.length === 0 ? (
          <div className="text-center text-[#446655] text-sm py-8">
            NO TRANSMISSIONS
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              onClick={() => onMessageClick(message)}
              className={`
                message p-3 mb-2 rounded cursor-pointer transition-all
                bg-[#00ff8808] border border-[#1a2420]
                hover:bg-[#00ff8815] hover:border-[#00aa55]
                ${message.priority === 'emergency' ? 'border-l-[3px] border-l-[#ff4455]' :
                  message.priority === 'priority' ? 'border-l-[3px] border-l-[#ffaa00]' :
                  !message.is_read ? 'border-l-[3px] border-l-[#00ff88]' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`font-bold text-xs ${
                  message.priority === 'emergency' ? 'text-[#ff4455]' :
                  message.priority === 'priority' ? 'text-[#ffaa00]' : 'text-[#00ff88]'
                }`}>
                  {message.sender}
                </span>
                <span className="text-[0.65rem] text-[#446655]">
                  {timeAgo(message.sent_at)}
                </span>
              </div>
              <div className="text-xs text-[#88bbaa] line-clamp-2">
                {message.encrypted ? (
                  <span className="text-[#ff4455]">●●●●●● ●●●●●●● ●●●●●● ●●●●...</span>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
