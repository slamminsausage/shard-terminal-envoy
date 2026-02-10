import { createContext, useContext } from "react";
import type { VTTAudioApi } from "@/hooks/useVTTAudio";

const VTTAudioContext = createContext<VTTAudioApi | null>(null);

export const VTTAudioProvider = VTTAudioContext.Provider;

export function useVTTAudioApi(): VTTAudioApi {
  const ctx = useContext(VTTAudioContext);
  if (!ctx) {
    throw new Error("useVTTAudioApi must be used within VTTAudioProvider");
  }
  return ctx;
}
