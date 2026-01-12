export interface PlayerNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdBy: 'player' | 'gm';
  tags?: string[];
}

export interface Handout {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isVisible: boolean; // GM controls visibility to players
  tags?: string[];
  attachments?: HandoutAttachment[];
}

export interface HandoutAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'audio' | 'other';
  url: string;
}

export interface GMNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}
