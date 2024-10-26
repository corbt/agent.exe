import { createStore } from 'zustand/vanilla';
import { createDispatch } from 'zutron/main';
import { AppState } from './types';
import { runAgent } from './runAgent';

export const store = createStore<AppState>((set, get) => ({
  instructions: 'find flights from seattle to sf for next tuesday to thursday',
  fullyAuto: true,
  running: false,
  error: null,
  runHistory: [],
  chatSource: 'local',
  telegramContext: null,
  RUN_AGENT: async () => runAgent(set, get),
  STOP_RUN: () => set({ running: false }),
  SET_INSTRUCTIONS: (instructions) => set({ instructions }),
  SET_FULLY_AUTO: (fullyAuto) => {
    set({ fullyAuto: fullyAuto ?? true });
  },
  SET_CHAT_SOURCE: (source) => set({ chatSource: source }),
  SET_TELEGRAM_CONTEXT: (ctx) => set({ telegramContext: ctx }),
  CLEAR_HISTORY: () => set({ runHistory: [] }),
}));

export const dispatch = createDispatch(store);
