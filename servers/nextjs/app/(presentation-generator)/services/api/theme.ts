/**
 * Theme API — the FastAPI theme service has been removed in the cloud version.
 * Reads degrade gracefully to empty so the editor/header never breaks; write
 * actions surface a clear message instead of hitting a dead endpoint.
 */
import { Theme, ThemeParams } from "./types";

const NOT_AVAILABLE =
  "Eigene Themes sind in der Cloud-Version noch nicht verfügbar.";

class ThemeApi {
  static async getThemes(): Promise<Theme[]> {
    return [];
  }

  static async getUserFonts(): Promise<{ font_name: string; font_url: string }[]> {
    return [];
  }

  static async createTheme(_theme: ThemeParams): Promise<Theme> {
    throw new Error(NOT_AVAILABLE);
  }

  static async updateTheme(_theme: ThemeParams): Promise<Theme> {
    throw new Error(NOT_AVAILABLE);
  }

  static async deleteTheme(_themeId: string): Promise<{ success: boolean }> {
    throw new Error(NOT_AVAILABLE);
  }

  static async generateTheme(_args: { primary?: string; background?: string }) {
    throw new Error("Automatische Theme-Generierung ist in der Cloud-Version noch nicht verfügbar.");
  }

  static async uploadFont(_font: File): Promise<{ font_name: string; font_url: string }> {
    throw new Error("Schriftarten-Upload ist in der Cloud-Version noch nicht verfügbar.");
  }
}

export default ThemeApi;
