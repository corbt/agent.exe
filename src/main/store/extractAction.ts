import { BetaMessageParam } from '@anthropic-ai/sdk/resources/beta/messages/messages';
import { NextAction } from './types';

export const extractAction = (
  message: BetaMessageParam,
): {
  action: NextAction;
  reasoning: string;
  toolId: string;
} => {
  const reasoning = typeof message.content === 'string'
    ? message.content
    : message.content
        .filter((content) => content.type === 'text')
        .map((content) => (content as { text: string }).text)
        .join(' ');

  const lastMessage = typeof message.content === 'string' 
    ? null 
    : message.content[message.content.length - 1];

  if (!lastMessage || typeof lastMessage === 'string') {
    return {
      action: { type: 'error', message: 'No tool called' },
      reasoning,
      toolId: '',
    };
  }

  if (lastMessage.type !== 'tool_use') {
    return {
      action: { type: 'error', message: 'No tool called' },
      reasoning,
      toolId: '',
    };
  }
  if (lastMessage.name === 'finish_run') {
    const input = lastMessage.input as {
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
  if (lastMessage.name !== 'computer') {
    return {
      action: {
        type: 'error',
        message: `Wrong tool called: ${lastMessage.name}`,
      },
      reasoning,
      toolId: '',
    };
  }

  const { action, coordinate, text } = lastMessage.input as {
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
