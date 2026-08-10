export type ColorTemperature = "warm" | "neutral" | "cool";

export interface AwakenLightOptions {
  brightness: number; // 0-100
  colorTemperature: ColorTemperature;
}

/**
 * Implement against the real Hue bridge service (or whichever light service the
 * app uses) and inject that implementation from the server/page. Never hardcode
 * bridge credentials or API keys in client code — resolve them server-side and
 * expose only a call like this one to the client.
 */
export interface LightController {
  turnOn(options: AwakenLightOptions): Promise<void>;
}

export class LightControllerUnavailableError extends Error {
  constructor(message = "Light controller is not configured yet") {
    super(message);
    this.name = "LightControllerUnavailableError";
  }
}
