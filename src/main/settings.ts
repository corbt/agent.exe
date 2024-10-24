import Store from 'electron-store';
import { AppState } from './store/types';

interface SettingsSchema {
  instructions: string | null;
  fullyAuto: boolean;
}

const store = new Store<SettingsSchema>({
  defaults: {
    instructions: null,
    fullyAuto: true,
  },
});

export const loadSettings = (): Partial<AppState> => ({
  instructions: store.get('instructions'),
  fullyAuto: store.get('fullyAuto'),
});

export const saveSettings = (state: Partial<AppState>) => {
  if (state.instructions !== undefined) {
    store.set('instructions', state.instructions);
  }
  if (state.fullyAuto !== undefined) {
    store.set('fullyAuto', state.fullyAuto);
  }
};
