import { createStore } from 'zustand/vanilla';
import { createDispatch } from 'zutron/main';
import { AppState } from './types';
import { runAgent } from './runAgent';
import { loadSettings, saveSettings } from '../settings';
import log from 'electron-log';

const initialSettings = loadSettings();

export const store = createStore<AppState>((set, get) => ({
  instructions: initialSettings.instructions ?? '',
  fullyAuto: initialSettings.fullyAuto ?? true,
  systemPrompt: initialSettings.systemPrompt ?? '',
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
  SET_SYSTEM_PROMPT: (systemPrompt) => {
    set({ systemPrompt });
    saveSettings({ systemPrompt });
  },
  CLEAR_HISTORY: () => set({ runHistory: [] }),
  feedbackRequest: null,
  SET_FEEDBACK_REQUEST: (request) => set({ feedbackRequest: request }),
  SUBMIT_FEEDBACK: (response) => {
    // Handle the feedback response
  },
  userInput: null,
  ADD_USER_INPUT: (input) => {
    log.info('Store: ADD_USER_INPUT action received:', input);
    const newInput = { id: Date.now().toString(), role: 'user', content: input };
    set({ userInput: newInput });
    log.info('Store: Updated state after ADD_USER_INPUT:', get());
    // Check if the agent is not running, and if so, start it
    if (!get().running) {
      log.info('Store: Agent not running, restarting...');
      runAgent(set, get);
    }
  },
}));

export const dispatch = createDispatch(store);
