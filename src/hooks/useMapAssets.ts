import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { MapAsset, AssetLibraryItem } from "@/lib/bridge/bridgeTypes";

const BUCKET = "vtt_assets";
const LOCAL_ASSETS_KEY = "vtt_map_assets_local";
const LOCAL_LIBRARY_KEY = "vtt_asset_library_local";

const supabaseEnabled = !(
  import.meta.env?.VITE_DISABLE_SUPABASE === "true" ||
  ((import.meta.env?.DEV ?? false) && import.meta.env?.VITE_ENABLE_SUPABASE !== "true")
);

interface DbMapAssetRow {
  id: string;
  bridge_state_id: string;
  name: string;
  storage_path: string;
  svg_x: number;
  svg_y: number;
  width: number;
  height: number;
  rotation: number;
  z_index: number;
  created_at: string;
}

function rowToAsset(row: DbMapAssetRow, urlBase: string): MapAsset {
  const publicUrl = `${urlBase}/storage/v1/object/public/${BUCKET}/${row.storage_path}`;
  return {
    id: row.id,
    bridgeStateId: row.bridge_state_id,
    name: row.name,
    storagePath: row.storage_path,
    url: publicUrl,
    svgX: row.svg_x,
    svgY: row.svg_y,
    width: row.width,
    height: row.height,
    rotation: row.rotation,
    zIndex: row.z_index,
    createdAt: row.created_at,
  };
}

function getSupabaseUrl(): string {
  // The supabase URL is embedded in the client; extract base
  return "https://uyzzwiakehkoztprcikx.supabase.co";
}

function getPublicUrl(storagePath: string): string {
  return `${getSupabaseUrl()}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}

// ── localStorage fallback helpers ─────────────────────────────────────────
function loadLocalAssets(): MapAsset[] {
  try {
    const raw = localStorage.getItem(LOCAL_ASSETS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MapAsset[];
  } catch {
    return [];
  }
}

function saveLocalAssets(assets: MapAsset[]) {
  try {
    localStorage.setItem(LOCAL_ASSETS_KEY, JSON.stringify(assets));
  } catch {}
}

function loadLocalLibrary(): AssetLibraryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_LIBRARY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AssetLibraryItem[];
  } catch {
    return [];
  }
}

function saveLocalLibrary(items: AssetLibraryItem[]) {
  try {
    localStorage.setItem(LOCAL_LIBRARY_KEY, JSON.stringify(items));
  } catch {}
}

export function useMapAssets(bridgeStateId: string) {
  const [library, setLibrary] = useState<AssetLibraryItem[]>([]);
  const [mapAssets, setMapAssets] = useState<MapAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  // ── Load library (storage bucket listing) ────────────────────────────
  const loadLibrary = useCallback(async () => {
    if (!supabaseEnabled) {
      setLibrary(loadLocalLibrary());
      return;
    }
    try {
      const { data, error } = await supabase.storage.from(BUCKET).list("", { limit: 200 });
      if (error) {
        console.error("Failed to list VTT assets:", error);
        setLibrary(loadLocalLibrary());
        return;
      }
      const items: AssetLibraryItem[] = (data ?? [])
        .filter(f => f.name && !f.name.startsWith("."))
        .map(f => ({
          storagePath: f.name,
          name: f.name,
          url: getPublicUrl(f.name),
        }));
      if (isMountedRef.current) setLibrary(items);
    } catch {
      setLibrary(loadLocalLibrary());
    }
  }, []);

  // ── Load placed assets ────────────────────────────────────────────────
  const loadMapAssets = useCallback(async () => {
    if (!supabaseEnabled) {
      const local = loadLocalAssets().filter(a => a.bridgeStateId === bridgeStateId);
      setMapAssets(local);
      return;
    }
    try {
      const { data, error } = await (supabase as any)
        .from("vtt_map_assets")
        .select("*")
        .eq("bridge_state_id", bridgeStateId)
        .order("z_index", { ascending: true });

      if (error) {
        console.error("Failed to load map assets:", error);
        const local = loadLocalAssets().filter(a => a.bridgeStateId === bridgeStateId);
        if (isMountedRef.current) setMapAssets(local);
        return;
      }
      const urlBase = getSupabaseUrl();
      const assets = (data as DbMapAssetRow[]).map(row => rowToAsset(row, urlBase));
      if (isMountedRef.current) setMapAssets(assets);
    } catch {
      const local = loadLocalAssets().filter(a => a.bridgeStateId === bridgeStateId);
      if (isMountedRef.current) setMapAssets(local);
    }
  }, [bridgeStateId]);

  // Initial load
  useEffect(() => {
    loadLibrary();
    loadMapAssets();
  }, [loadLibrary, loadMapAssets]);

  // ── Upload new file to bucket ─────────────────────────────────────────
  const uploadAsset = useCallback(async (file: File): Promise<AssetLibraryItem | null> => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
    const safeBase = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_").replace(/\.[^.]+$/, "");
    const storagePath = `${safeBase}_${Date.now()}.${ext}`;

    setUploading(true);
    try {
      if (supabaseEnabled) {
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, file, { contentType: file.type, upsert: false });
        if (error) {
          console.error("Upload failed:", error);
          return null;
        }
        const item: AssetLibraryItem = {
          storagePath,
          name: file.name,
          url: getPublicUrl(storagePath),
        };
        if (isMountedRef.current) setLibrary(prev => [...prev, item]);
        return item;
      } else {
        // Offline: store as data URL
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const item: AssetLibraryItem = {
          storagePath,
          name: file.name,
          url: dataUrl,
        };
        const updated = [...loadLocalLibrary(), item];
        saveLocalLibrary(updated);
        if (isMountedRef.current) setLibrary(updated);
        return item;
      }
    } finally {
      if (isMountedRef.current) setUploading(false);
    }
  }, []);

  // ── Delete from library ───────────────────────────────────────────────
  const deleteLibraryAsset = useCallback(async (storagePath: string) => {
    if (supabaseEnabled) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
    } else {
      const updated = loadLocalLibrary().filter(i => i.storagePath !== storagePath);
      saveLocalLibrary(updated);
    }
    if (isMountedRef.current) setLibrary(prev => prev.filter(i => i.storagePath !== storagePath));
  }, []);

  // ── Place asset on map ────────────────────────────────────────────────
  const placeAsset = useCallback(async (
    item: AssetLibraryItem,
    svgX: number,
    svgY: number,
    width = 80,
    height = 80,
  ): Promise<MapAsset | null> => {
    const nextZIndex = mapAssets.length > 0
      ? Math.max(...mapAssets.map(a => a.zIndex)) + 1
      : 0;

    if (supabaseEnabled) {
      try {
        const { data, error } = await (supabase as any)
          .from("vtt_map_assets")
          .insert({
            bridge_state_id: bridgeStateId,
            name: item.name,
            storage_path: item.storagePath,
            svg_x: svgX,
            svg_y: svgY,
            width,
            height,
            rotation: 0,
            z_index: nextZIndex,
          })
          .select()
          .single();

        if (error) throw error;
        const asset = rowToAsset(data as DbMapAssetRow, getSupabaseUrl());
        if (isMountedRef.current) setMapAssets(prev => [...prev, asset]);
        return asset;
      } catch (err) {
        console.error("Failed to place asset:", err);
        return null;
      }
    } else {
      const asset: MapAsset = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        bridgeStateId,
        name: item.name,
        storagePath: item.storagePath,
        url: item.url,
        svgX,
        svgY,
        width,
        height,
        rotation: 0,
        zIndex: nextZIndex,
        createdAt: new Date().toISOString(),
      };
      const all = [...loadLocalAssets(), asset];
      saveLocalAssets(all);
      if (isMountedRef.current) setMapAssets(prev => [...prev, asset]);
      return asset;
    }
  }, [bridgeStateId, mapAssets]);

  // ── Update placed asset (position, scale, rotation) ──────────────────
  const updateMapAsset = useCallback(async (
    id: string,
    updates: Partial<Pick<MapAsset, "svgX" | "svgY" | "width" | "height" | "rotation" | "zIndex">>,
  ) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.svgX !== undefined) dbUpdates.svg_x = updates.svgX;
    if (updates.svgY !== undefined) dbUpdates.svg_y = updates.svgY;
    if (updates.width !== undefined) dbUpdates.width = updates.width;
    if (updates.height !== undefined) dbUpdates.height = updates.height;
    if (updates.rotation !== undefined) dbUpdates.rotation = updates.rotation;
    if (updates.zIndex !== undefined) dbUpdates.z_index = updates.zIndex;
    dbUpdates.updated_at = new Date().toISOString();

    // Optimistic update
    if (isMountedRef.current) {
      setMapAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    }

    if (supabaseEnabled) {
      try {
        await (supabase as any)
          .from("vtt_map_assets")
          .update(dbUpdates)
          .eq("id", id);
      } catch (err) {
        console.error("Failed to update map asset:", err);
      }
    } else {
      const all = loadLocalAssets().map(a => a.id === id ? { ...a, ...updates } : a);
      saveLocalAssets(all);
    }
  }, []);

  // ── Delete placed asset ───────────────────────────────────────────────
  const deleteMapAsset = useCallback(async (id: string) => {
    if (isMountedRef.current) {
      setMapAssets(prev => prev.filter(a => a.id !== id));
    }

    if (supabaseEnabled) {
      try {
        await (supabase as any).from("vtt_map_assets").delete().eq("id", id);
      } catch (err) {
        console.error("Failed to delete map asset:", err);
      }
    } else {
      const all = loadLocalAssets().filter(a => a.id !== id);
      saveLocalAssets(all);
    }
  }, []);

  return {
    library,
    mapAssets,
    uploading,
    uploadAsset,
    deleteLibraryAsset,
    placeAsset,
    updateMapAsset,
    deleteMapAsset,
    reloadLibrary: loadLibrary,
    reloadMapAssets: loadMapAssets,
  };
}
