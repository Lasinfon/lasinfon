// store/slices/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState } from '../../types/diagnostic';

const initialState: UIState = {
  step: 1,
  inputText: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<UIState['step']>) {
      state.step = action.payload;
    },
    setInputText(state, action: PayloadAction<string>) {
      state.inputText = action.payload;
    },
    resetUI(state) {
      state.step = 1;
      state.inputText = '';
    },
  },
});

export const { setStep, setInputText, resetUI } = uiSlice.actions;
export default uiSlice.reducer;
