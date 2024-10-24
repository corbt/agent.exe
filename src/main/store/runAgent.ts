import {
  BetaMessage,
  BetaMessageParam,
} from '@anthropic-ai/sdk/resources/beta/messages/messages';
import { Button, Key, keyboard, mouse, Point } from '@nut-tree-fork/nut-js';
// import { createCanvas, loadImage } from 'canvas';
import { desktopCapturer, screen } from 'electron';
import { anthropic } from './anthropic';
import { AppState, NextAction } from './types';
import { extractAction } from './extractAction';
import log from 'electron-log';
import { store } from './create'; // Import the store

const MAX_STEPS = 50;

function getScreenDimensions(): { width: number; height: number } {
  const primaryDisplay = screen.getPrimaryDisplay();
  return primaryDisplay.size;
}

function getAiScaledScreenDimensions(): { width: number; height: number } {
  const { width, height } = getScreenDimensions();
  const aspectRatio = width / height;

  let scaledWidth: number;
  let scaledHeight: number;

  if (aspectRatio > 1280 / 800) {
    // Width is the limiting factor
    scaledWidth = 1280;
    scaledHeight = Math.round(1280 / aspectRatio);
  } else {
    // Height is the limiting factor
    scaledHeight = 800;
    scaledWidth = Math.round(800 * aspectRatio);
  }

  return { width: scaledWidth, height: scaledHeight };
}

const getScreenshot = async () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;
  const aiDimensions = getAiScaledScreenDimensions();

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width, height },
  });
  const primarySource = sources[0]; // Assuming the first source is the primary display

  if (primarySource) {
    const screenshot = primarySource.thumbnail;
    // Resize the screenshot to AI dimensions
    const resizedScreenshot = screenshot.resize(aiDimensions);
    // Convert the resized screenshot to a base64-encoded PNG
    const base64Image = resizedScreenshot.toPNG().toString('base64');
    return base64Image;
  }
  throw new Error('No display found for screenshot');
};

const mapToAiSpace = (x: number, y: number) => {
  const { width, height } = getScreenDimensions();
  const aiDimensions = getAiScaledScreenDimensions();
  return {
    x: (x * aiDimensions.width) / width,
    y: (y * aiDimensions.height) / height,
  };
};

const mapFromAiSpace = (x: number, y: number) => {
  const { width, height } = getScreenDimensions();
  const aiDimensions = getAiScaledScreenDimensions();
  return {
    x: (x * width) / aiDimensions.width,
    y: (y * height) / aiDimensions.height,
  };
};

const promptForAction = async (
  runHistory: BetaMessageParam[],
  systemPrompt: string
): Promise<BetaMessageParam> => {
  // Strip images from all but the last message
  const historyWithoutImages = runHistory.map((msg, index) => {
    if (index === runHistory.length - 1) return msg; // Keep the last message intact
    if (Array.isArray(msg.content)) {
      return {
        ...msg,
        content: msg.content.map((item) => {
          if (item.type === 'tool_result' && typeof item.content !== 'string') {
            return {
              ...item,
              content: item.content?.filter((c) => c.type !== 'image'),
            };
          }
          return item;
        }),
      };
    }
    return msg;
  });

  try {
    const message = await anthropic.beta.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: historyWithoutImages,
      tools: [
        {
          type: 'computer_20241022',
          name: 'computer',
          display_width_px: getAiScaledScreenDimensions().width,
          display_height_px: getAiScaledScreenDimensions().height,
          display_number: 1,
        },
        {
          name: 'finish_run',
          description:
            'Call this function when you have achieved the goal of the task.',
          input_schema: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: 'Whether the task was successful',
              },
              error: {
                type: 'string',
                description: 'The error message if the task was not successful',
              },
            },
            required: ['success'],
          },
        },
      ],
      betas: ['computer-use-2024-10-22'],
    });

    return { content: message.content, role: message.role }; // Ensure this line is present
  } catch (error) {
    log.error('Error in promptForAction:', error);
    log.error('Message stack:', historyWithoutImages);
    throw error;
  }
};

export const performAction = async (action: NextAction) => {
  switch (action.type) {
    case 'mouse_move':
      const { x, y } = mapFromAiSpace(action.x, action.y);
      await mouse.setPosition(new Point(x, y));
      break;
    case 'left_click_drag':
      const { x: dragX, y: dragY } = mapFromAiSpace(action.x, action.y);
      const currentPosition = await mouse.getPosition();
      await mouse.drag([currentPosition, new Point(dragX, dragY)]);
      break;
    case 'cursor_position':
      const position = await mouse.getPosition();
      const aiPosition = mapToAiSpace(position.x, position.y);
      // TODO: actually return the position
      break;
    case 'left_click':
      await mouse.leftClick();
      break;
    case 'right_click':
      await mouse.rightClick();
      break;
    case 'middle_click':
      await mouse.click(Button.MIDDLE);
      break;
    case 'double_click':
      await mouse.doubleClick(Button.LEFT);
      break;
    case 'type':
      // Set typing delay to 0ms for instant typing
      keyboard.config.autoDelayMs = 0;
      await keyboard.type(action.text);
      // Reset delay back to default if needed
      keyboard.config.autoDelayMs = 500;
      break;
    case 'key':
      const keyMap = {
        Return: Key.Enter,
      };
      const keys = action.text.split('+').map((key) => {
        const mappedKey = keyMap[key as keyof typeof keyMap];
        if (!mappedKey) {
          throw new Error(`Tried to press unknown key: ${key}`);
        }
        return mappedKey;
      });
      await keyboard.pressKey(...keys);
      break;
    case 'screenshot':
      // Don't do anything since we always take a screenshot after each step
      break;
    default:
      throw new Error(`Unsupported action: ${action.type}`);
  }
};

export const runAgent = async (
  setState: (state: Partial<AppState>) => void,
  getState: () => AppState
) => {
  setState({
    running: true,
    runHistory: [{ role: 'user', content: getState().instructions ?? '' }],
    error: null,
  });

  while (getState().running) {
    if (getState().runHistory.length >= MAX_STEPS * 2) {
      setState({
        error: 'Maximum steps exceeded',
        running: false,
      });
      break;
    }

    try {
      const message = await promptForAction(getState().runHistory, getState().systemPrompt);
      setState({
        runHistory: [...getState().runHistory, message],
      });
      const { action, reasoning, toolId } = extractAction(
        message as BetaMessage,
      );
      console.log('REASONING', reasoning);
      console.log('ACTION', action);

      if (action.type === 'error') {
        setState({
          error: action.message,
          running: false,
        });
        break;
      } else if (action.type === 'finish') {
        setState({
          running: false,
        });
        break;
      }
      if (!getState().running) {
        break;
      }
      await performAction(action);

      await new Promise((resolve) => setTimeout(resolve, 500));
      if (!getState().running) {
        break;
      }

      setState({
        runHistory: [
          ...getState().runHistory,
          {
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: toolId,
                content: [
                  {
                    type: 'text',
                    text: 'Here is a screenshot after the action was executed',
                  },
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                      media_type: 'image/png',
                      data: await getScreenshot(),
                    },
                  },
                ],
              },
            ],
          },
        ],
      });

      // Check for user input
      if (getState().userInput) {
        const userInput = getState().userInput;
        setState({ userInput: null });
        // Add the user input to the message stack
        setState({
          runHistory: [...getState().runHistory, { role: 'user', content: userInput.content }],
        });
      }
    } catch (error: unknown) {
      log.error('Error in runAgent:', error);
      log.error('Full message stack:', JSON.stringify(getState().runHistory, null, 2));
      let errorMessage = 'An unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }
      setState({
        error: `Error: ${errorMessage}. Please try again or check the logs for more details.`,
        running: false,
      });
      break;
    }
  }
};
