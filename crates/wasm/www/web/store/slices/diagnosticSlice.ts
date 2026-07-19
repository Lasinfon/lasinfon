// store/slices/diagnosticSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DiagnosticResult, DiagnosticState } from '../../types/diagnostic';

const initialState: DiagnosticState = {
  isLoading: false,
  result: null,
  error: null,
  logs: [],
};

const diagnosticSlice = createSlice({
  name: 'diagnostic',
  initialState,
  reducers: {
    startDiagnostic(state) {
      state.isLoading = true;
      state.error = null;
      state.logs = [];
      state.result = null;
    },
    addDiagnosticLog(state, action: PayloadAction<string>) {
      state.logs.push(action.payload);
    },
    setDiagnosticResult(state, action: PayloadAction<DiagnosticResult>) {
      state.result = action.payload;
      state.isLoading = false;
    },
    setDiagnosticError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    resetDiagnostic(state) {
      state.isLoading = false;
      state.result = null;
      state.error = null;
      state.logs = [];
    },
  },
});

export const { startDiagnostic, addDiagnosticLog, setDiagnosticResult, setDiagnosticError, resetDiagnostic } = diagnosticSlice.actions;
export default diagnosticSlice.reducer;
