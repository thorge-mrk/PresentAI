import { Theme, ThemeParams } from "./types"

/**
 * Theme API — cloud version. Custom theme storage and LLM theme generation
 * were FastAPI features; presentations now use the built-in template themes.
 */
class ThemeApi {
  static async getThemes(): Promise<Theme[]> {
    return [];
  }

  static async createTheme(_theme: ThemeParams) {
    throw new Error("Custom themes are not available in the cloud version.");
  }

  static async updateTheme(_theme: ThemeParams) {
    throw new Error("Custom themes are not available in the cloud version.");
  }

  static async deleteTheme(_themeId: string) {
    throw new Error("Custom themes are not available in the cloud version.");
  }

  static async generateTheme(_opts: { primary?: string; background?: string }) {
    throw new Error("AI theme generation is not available in the cloud version.");
  }

  static async uploadFont(_font: File) {
    throw new Error("Font upload is not available in the cloud version.");
  }

  static async getUserFonts() {
    return [];
  }
}

export default ThemeApi
