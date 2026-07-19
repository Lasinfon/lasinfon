// store/index.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import configReducer from './slices/configSlice';
import diagnosticReducer from './slices/diagnosticSlice';

const rootReducer = combineReducers({
  ui: uiReducer,
  config: configReducer,
  diagnostic: diagnosticReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
