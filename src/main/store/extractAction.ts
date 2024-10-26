import { ChatCompletionRequestMessage, ChatCompletionResponseMessage } from 'openai';
import { NextAction } from './types';

export const extractAction = (
  message: ChatCompletionResponseMessage,
): {
  action: NextAction;
  reasoning: string;
  toolId: string;
} => {
  const reasoning = message.content;

  const lastMessage = message;
  if (typeof lastMessage === 'string') {
    return {
      action: { type: 'error', message: 'No tool called' },
      reasoning,
      toolId: '',
    };
  }

  if (lastMessage.role !== 'assistant') {
    return {
      action: { type: 'error', message: 'No tool called' },
      reasoning,
      toolId: '',
    };
  }
  if (lastMessage.content.includes('finish_run')) {
    const input = JSON.parse(lastMessage.content) as {
      success: boolean;
      error?: string;
    };
    if (!input.success) {
      return {
        action: {
          type: 'error',
          message: input.error ?? 'Agent encountered unknown error',
        },
        reasoning,
        toolId: lastMessage.id,
      };
    }
    return {
      action: { type: 'finish' },
      reasoning,
      toolId: lastMessage.id,
    };
  }
  if (!lastMessage.content.includes('computer')) {
    return {
      action: {
        type: 'error',
        message: `Wrong tool called: ${lastMessage.content}`,
      },
      reasoning,
      toolId: '',
    };
  }

  const { action, coordinate, text } = JSON.parse(lastMessage.content) as {
    action: string;
    coordinate?: [number, number];
    text?: string;
  };

  // Convert toolUse into NextAction
  let nextAction: NextAction;
  switch (action) {
    case 'type':
    case 'key':
      if (!text) {
        nextAction = {
          type: 'error',
          message: `No text provided for ${action}`,
        };
      } else {
        nextAction = { type: action, text };
      }
      break;
    case 'mouse_move':
      if (!coordinate) {
        nextAction = { type: 'error', message: 'No coordinate provided' };
      } else {
        const [x, y] = coordinate;
        nextAction = { type: 'mouse_move', x, y };
      }
      break;
    case 'left_click':
      nextAction = { type: 'left_click' };
      break;
    case 'left_click_drag':
      if (!coordinate) {
        nextAction = {
          type: 'error',
          message: 'No coordinate provided for drag',
        };
      } else {
        const [x, y] = coordinate;
        nextAction = { type: 'left_click_drag', x, y };
      }
      break;
    case 'right_click':
      nextAction = { type: 'right_click' };
      break;
    case 'middle_click':
      nextAction = { type: 'middle_click' };
      break;
    case 'double_click':
      nextAction = { type: 'double_click' };
      break;
    case 'screenshot':
      nextAction = { type: 'screenshot' };
      break;
    case 'cursor_position':
      nextAction = { type: 'cursor_position' };
      break;
    case 'finish':
      nextAction = { type: 'finish' };
      break;
    default:
      nextAction = {
        type: 'error',
        message: `Unsupported computer action: ${action}`,
      };
  }

  return { action: nextAction, reasoning, toolId: lastMessage.id };
};
