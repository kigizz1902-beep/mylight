export type WeatherCondition = "rain" | "clear" | "cloudy" | "unknown";

export interface WeatherSnapshot {
  locationName: string;
  condition: WeatherCondition;
}

/** Implement against the real weather API and inject that implementation from the page/server. */
export interface WeatherProvider {
  getCurrentWeather(): Promise<WeatherSnapshot>;
}

export class WeatherUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("Weather data is unavailable");
    this.name = "WeatherUnavailableError";
    this.cause = cause;
  }
}
