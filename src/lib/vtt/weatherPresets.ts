import type { ParticleConfig } from "@/types/vtt";

export type WeatherPresetName = "rain" | "snow" | "dust" | "embers" | "fog" | "ash";

export const weatherPresets: Record<WeatherPresetName, Partial<ParticleConfig>> = {
  rain: {
    count: 200,
    speed: 4,
    size: 2,
    color: "#8899cc",
    opacity: 0.5,
    wind: 0.5,
    gravity: 3,
  },
  snow: {
    count: 150,
    speed: 0.8,
    size: 3,
    color: "#ffffff",
    opacity: 0.7,
    wind: 0.3,
    gravity: 0.5,
  },
  dust: {
    count: 60,
    speed: 0.3,
    size: 2,
    color: "#c4a86b",
    opacity: 0.4,
    wind: 0.8,
    gravity: 0.1,
  },
  embers: {
    count: 40,
    speed: 0.6,
    size: 2,
    color: "#ff6622",
    opacity: 0.8,
    wind: 0.2,
    gravity: -0.3,
  },
  fog: {
    count: 30,
    speed: 0.15,
    size: 20,
    color: "#aaaaaa",
    opacity: 0.2,
    wind: 0.4,
    gravity: 0,
  },
  ash: {
    count: 80,
    speed: 0.4,
    size: 3,
    color: "#888888",
    opacity: 0.5,
    wind: 0.6,
    gravity: 0.2,
  },
};
