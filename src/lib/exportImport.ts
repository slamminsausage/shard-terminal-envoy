import type { Character, Vehicle } from '@/types/database';
import type { WorldNote, HexMarker } from '@/types/navigation';

export interface CampaignExport {
  version: string;
  exportDate: string;
  characters: Character[];
  vehicles: Vehicle[];
  worldNotes: WorldNote[];
  hexMarkers: HexMarker[];
}

/**
 * Export campaign data to JSON
 */
export function exportCampaignData(
  characters: Character[],
  vehicles: Vehicle[],
  worldNotes: WorldNote[],
  hexMarkers: HexMarker[]
): string {
  const exportData: CampaignExport = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    characters,
    vehicles,
    worldNotes,
    hexMarkers,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download campaign data as a JSON file
 */
export function downloadCampaignData(
  characters: Character[],
  vehicles: Vehicle[],
  worldNotes: WorldNote[],
  hexMarkers: HexMarker[],
  filename?: string
): void {
  const jsonData = exportCampaignData(characters, vehicles, worldNotes, hexMarkers);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `campaign-export-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validate imported campaign data
 */
export function validateCampaignImport(data: any): data is CampaignExport {
  if (!data || typeof data !== 'object') {
    return false;
  }

  if (!data.version || !data.exportDate) {
    return false;
  }

  if (!Array.isArray(data.characters)) {
    return false;
  }

  if (!Array.isArray(data.vehicles)) {
    return false;
  }

  if (!Array.isArray(data.worldNotes)) {
    return false;
  }

  if (!Array.isArray(data.hexMarkers)) {
    return false;
  }

  return true;
}

/**
 * Parse and validate imported campaign data from JSON string
 */
export function parseCampaignImport(jsonString: string): CampaignExport | null {
  try {
    const data = JSON.parse(jsonString);

    if (!validateCampaignImport(data)) {
      console.error('Invalid campaign data format');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to parse campaign data:', error);
    return null;
  }
}

/**
 * Export specific characters to JSON
 */
export function exportCharacters(characters: Character[]): string {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    type: 'characters',
    data: characters,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export specific vehicles to JSON
 */
export function exportVehicles(vehicles: Vehicle[]): string {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    type: 'vehicles',
    data: vehicles,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download specific items as JSON
 */
export function downloadJSON(data: any, filename: string): void {
  const jsonData = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
