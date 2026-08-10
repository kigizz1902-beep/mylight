"use client";

import * as React from "react";

import { RainyNightEncounter, type EncounterStage } from "@/components/rainy-night-encounter";
import type { WeatherProvider } from "@/lib/weather";
import type { LightController } from "@/lib/light-controller";
import { LightControllerUnavailableError } from "@/lib/light-controller";

/**
 * Placeholder weather adapter. Swap for a real call (server action / API route)
 * once the weather service is wired up — the shape below already matches what
 * RainyNightEncounter expects, so no visual code needs to change.
 */
const weatherProvider: WeatherProvider = {
  async getCurrentWeather() {
    return { locationName: "서울", condition: "rain" };
  },
};

/**
 * Placeholder light adapter. Intentionally NOT a fake success — until the real
 * Hue bridge integration exists, this rejects so the encounter's retry/error UI
 * is exercised honestly instead of pretending a light turned on.
 */
const lightController: LightController = {
  async turnOn() {
    throw new LightControllerUnavailableError();
  },
};

export default function AwakenPage() {
  const [locationLabel, setLocationLabel] = React.useState("서울");
  const [weatherCondition, setWeatherCondition] = React.useState<"rain" | "clear" | "cloudy" | "unknown">(
    "rain",
  );

  React.useEffect(() => {
    let cancelled = false;
    weatherProvider
      .getCurrentWeather()
      .then((snapshot) => {
        if (cancelled) return;
        setLocationLabel(snapshot.locationName);
        setWeatherCondition(snapshot.condition);
      })
      .catch(() => {
        // Weather couldn't be loaded — fall back to an ordinary night rather than an error screen.
        if (cancelled) return;
        setWeatherCondition("unknown");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleStageChange = React.useCallback((stage: EncounterStage) => {
    console.log("[awaken] stage changed:", stage);
  }, []);

  const handleAwaken = React.useCallback(async () => {
    await lightController.turnOn({ brightness: 15, colorTemperature: "warm" });
    // TODO: navigate to the naming step once that route exists.
  }, []);

  return (
    <RainyNightEncounter
      locationLabel={locationLabel}
      weatherCondition={weatherCondition}
      onStageChange={handleStageChange}
      onAwaken={handleAwaken}
    />
  );
}
