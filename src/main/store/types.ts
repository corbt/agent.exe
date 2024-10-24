import { BetaMessageParam } from '@anthropic-ai/sdk/resources/beta/messages/messages';

export type NextAction =
  | { type: 'key'; text: string }
  | { type: 'type'; text: string }
  | { type: 'mouse_move'; x: number; y: number }
  | { type: 'left_click' }
  | { type: 'left_click_drag'; x: number; y: number }
  | { type: 'right_click' }
  | { type: 'middle_click' }
  | { type: 'double_click' }
  | { type: 'screenshot' }
  | { type: 'cursor_position' }
  | { type: 'finish' }
  | { type: 'error'; message: string };

export type AppState = {
  instructions: string | null;
  fullyAuto: boolean;
  running: boolean;
  error: string | null;

  runHistory: BetaMessageParam[];

  RUN_AGENT: () => void;
  STOP_RUN: () => void;
  SET_INSTRUCTIONS: (instructions: string) => void;
  SET_FULLY_AUTO: (fullyAuto: boolean) => void;
  CLEAR_HISTORY: () => void;

  stepCount: number; // Track current step count
};
