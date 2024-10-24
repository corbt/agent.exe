import { createStore } from 'zustand/vanilla';
import { createDispatch } from 'zutron/main';
import { AppState } from './types';
import { runAgent } from './runAgent';
import { loadSettings, saveSettings } from '../settings';

const initialSettings = loadSettings();

export const store = createStore<AppState>((set, get) => ({
  instructions: initialSettings.instructions ?? '',
  fullyAuto: initialSettings.fullyAuto ?? true,
  systemPrompt: initialSettings.systemPrompt ?? '', // Add this line
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
  SET_SYSTEM_PROMPT: (systemPrompt) => { // Add this function
    set({ systemPrompt });
    saveSettings({ systemPrompt });
  },
  CLEAR_HISTORY: () => set({ runHistory: [] }),
}));

export const dispatch = createDispatch(store);
