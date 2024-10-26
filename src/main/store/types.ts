import { BetaMessageParam } from '@anthropic-ai/sdk/resources/beta/messages/messages';
import { Context } from 'telegraf';

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

export type ChatSource = 'local' | 'telegram';

export interface AppState {
  instructions: string | null;
  fullyAuto: boolean;
  running: boolean;
  error: string | null;
  runHistory: BetaMessageParam[];
  chatSource: ChatSource;
  telegramContext: Context | null;
  RUN_AGENT: () => Promise<void>;
  STOP_RUN: () => void;
  SET_INSTRUCTIONS: (instructions: string) => void;
  SET_FULLY_AUTO: (fullyAuto?: boolean) => void;
  SET_CHAT_SOURCE: (source: ChatSource) => void;
  SET_TELEGRAM_CONTEXT: (ctx: Context | null) => void;
  CLEAR_HISTORY: () => void;
}
