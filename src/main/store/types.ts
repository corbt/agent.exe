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

export type FeedbackRequest = {
  id: string;
  question: string;
};

export type FeedbackResponse = {
  id: string;
  answer: string;
};

export type UserInput = {
  id: string;
  content: string;
};

export type AppMessage = {
  role: 'user' | 'assistant';
  content: string | BetaMessageParam['content'];
};

export type AppState = {
  instructions: string | null;
  fullyAuto: boolean;
  running: boolean;
  error: string | null;
  runHistory: AppMessage[];
  systemPrompt: string;
  feedbackRequest: FeedbackRequest | null;
  userInput: UserInput | null;

  RUN_AGENT: () => void;
  STOP_RUN: () => void;
  SET_INSTRUCTIONS: (instructions: string) => void;
  SET_FULLY_AUTO: (fullyAuto: boolean) => void;
  SET_SYSTEM_PROMPT: (systemPrompt: string) => void;
  CLEAR_HISTORY: () => void;
  SET_FEEDBACK_REQUEST: (request: FeedbackRequest | null) => void;
  SUBMIT_FEEDBACK: (response: FeedbackResponse) => void;
  ADD_USER_INPUT: (input: string) => void;
};
