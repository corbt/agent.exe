import Store from 'electron-store';
import { AppState } from './store/types';

interface SettingsSchema {
  instructions: string | null;
  fullyAuto: boolean;
  systemPrompt: string;
}

const store = new Store<SettingsSchema>({
  defaults: {
    instructions: null,
    fullyAuto: true,
    systemPrompt: '',
  },
});

export const loadSettings = (): Partial<AppState> => ({
  instructions: store.get('instructions'),
  fullyAuto: store.get('fullyAuto'),
  systemPrompt: store.get('systemPrompt'),
});

export const saveSettings = (state: Partial<AppState>) => {
  if (state.instructions !== undefined) {
    store.set('instructions', state.instructions);
  }
  if (state.fullyAuto !== undefined) {
    store.set('fullyAuto', state.fullyAuto);
  }
  if (state.systemPrompt !== undefined) {
    store.set('systemPrompt', state.systemPrompt);
  }
};
