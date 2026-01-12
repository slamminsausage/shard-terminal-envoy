export interface PlayerNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdBy: 'player' | 'gm';
  folder?: string; // e.g., "planets", "locations", "npcs", "general"
  tags?: string[];
}

export interface Handout {
  id: string;
  title: string;
  description: string;
  type: 'text' | 'image' | 'video';
  content?: string; // for text handouts
  mediaUrl?: string; // for image/video handouts
  thumbnailUrl?: string; // optional thumbnail for videos
  createdAt: string;
  updatedAt: string;
  isVisible: boolean; // GM controls visibility to players
  tags?: string[];
}

export type NoteFolder = 'general' | 'planets' | 'locations' | 'npcs' | 'quests' | 'items' | 'other';
