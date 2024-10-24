import { createStore } from 'zustand/vanilla';
import { createDispatch } from 'zutron/main';
import { AppState } from './types';
import { runAgent } from './runAgent';
import { loadSettings, saveSettings } from '../settings';

const initialSettings = loadSettings();

export const store = createStore<AppState>((set, get) => ({
  instructions: initialSettings.instructions ?? 'find flights from seattle to sf for next tuesday to thursday',
  fullyAuto: initialSettings.fullyAuto ?? true,
  running: false,
  error: null,
  runHistory: [],
  RUN_AGENT: async () => runAgent(set, get),
  STOP_RUN: () => set({ running: false }),
  SET_INSTRUCTIONS: (instructions) => {
    set({ instructions });
    saveSettings({ instructions });
  },
  SET_FULLY_AUTO: (fullyAuto) => {
    set({ fullyAuto });
    saveSettings({ fullyAuto });
  },
  CLEAR_HISTORY: () => set({ runHistory: [] }),
}));

export const dispatch = createDispatch(store);
