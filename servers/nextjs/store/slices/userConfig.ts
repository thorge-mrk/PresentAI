import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Minimal config state for the cloud version.
 * All AI/image providers are fixed (Gemini via GCP service account + Unsplash/
 * Pexels on Supabase edge functions), so there are no user-changeable keys here.
 */
export interface CloudConfig {
  IMAGE_PROVIDER?: string;
  DISABLE_IMAGE_GENERATION?: boolean;
  PEXELS_API_KEY?: string;
  PIXABAY_API_KEY?: string;
}

interface UserConfigState {
  can_change_keys: boolean;
  llm_config: CloudConfig;
}

const initialState: UserConfigState = {
  can_change_keys: false,
  llm_config: { IMAGE_PROVIDER: "pexels" },
};

const userConfigSlice = createSlice({
  name: "userConfig",
  initialState,
  reducers: {
    setCanChangeKeys: (state, action: PayloadAction<boolean>) => {
      state.can_change_keys = action.payload;
    },
    setLLMConfig: (state, action: PayloadAction<CloudConfig>) => {
      state.llm_config = action.payload;
    },
  },
});

export const { setCanChangeKeys, setLLMConfig } = userConfigSlice.actions;
export default userConfigSlice.reducer;
