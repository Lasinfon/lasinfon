// store/slices/configSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ConfigState } from '../../types/diagnostic';
import { DEFAULT_MAX_TICKS, DEFAULT_SIGMA, DEFAULT_SEED } from '../../config/defaults';

const initialState: ConfigState = {
  maxTicks: DEFAULT_MAX_TICKS,
  sigma: DEFAULT_SIGMA,
  seed: DEFAULT_SEED,
  enableEmergence: false,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setMaxTicks(state, action: PayloadAction<number>) {
      state.maxTicks = action.payload;
    },
    setSigma(state, action: PayloadAction<number>) {
      state.sigma = action.payload;
    },
    setSeed(state, action: PayloadAction<number>) {
      state.seed = action.payload;
    },
    setEnableEmergence(state, action: PayloadAction<boolean>) {
      state.enableEmergence = action.payload;
    },
    resetConfig(state) {
      state.maxTicks = DEFAULT_MAX_TICKS;
      state.sigma = DEFAULT_SIGMA;
      state.seed = DEFAULT_SEED;
      state.enableEmergence = false;
    },
  },
});

export const { setMaxTicks, setSigma, setSeed, setEnableEmergence, resetConfig } = configSlice.actions;
export default configSlice.reducer;
