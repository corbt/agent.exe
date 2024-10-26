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
import { hideWindowBlock, showWindow } from '../window';

const MAX_STEPS = 50;

// Add message queue at the top of the file
let messageQueue: string[] = [];

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

const getScreenshot = async (): Promise<string> => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;
  const aiDimensions = getAiScaledScreenDimensions();

  return hideWindowBlock(async () => {
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
  });
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
): Promise<BetaMessageParam> => {
  // Strip images from all but the last message
  const historyWithoutImages = runHistory.map((msg, index) => {
    if (index === runHistory.length - 1) return msg; // Keep the last message intact
    if (Array.isArray(msg.content)) {
      return {
        ...msg,
        content: msg.content.map((item) => {
          if (item.type === 'tool_result' && typeof item.content !== 'string') {
            // If all content items are images, remove the entire tool_result
            const nonImageContent = item.content?.filter((c) => c.type !== 'image');
            if (!nonImageContent?.length) {
              return null;
            }
            // Otherwise return tool_result with only non-image content
            return {
              ...item,
              content: nonImageContent,
            };
          }
          return item;
        }).filter(Boolean), // Remove any null items
      };
    }
    return msg;
  });

  const message = await anthropic.beta.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
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
    system: `
      The user will ask you to perform a task, and you should use their computer to do so, utilizing 
      full access to all system functionalities and capabilities exactly as a human user would. You 
      can interact with any applications, files, settings, and system resources as needed to complete 
      the task, just as if you were physically using the computer yourself. This includes opening and 
      closing programs, navigating the file system, adjusting settings, and any other actions a human 
      could perform.

      If it is necessary to create a new account or log in to achieve the task, it is crucial to 
      explicitly ask the user for permission to do so and to identify what the desired inputs are. 
      When creating new accounts, always include the login information in the response to the user 
      when calling the finish_run tool.

      After each step, take a screenshot and carefully evaluate if you have achieved the right outcome. 
      Pay close attention to small details in the images, such as icons, buttons, and other visual 
      elements that might affect your progress. Explicitly show your thinking: "I have evaluated step X...". 
      If not correct, try again. Only when you confirm a step was executed correctly should you move on 
      to the next one. Note that you have to click into the browser address bar before typing a URL.

      When viewing web pages, use the Page Down and Page Up keys to scroll through and gather information 
      from the entire page content. This ensures you don't miss any important details that may be below 
      the initial viewport. Feel free to scroll all the way down to get a comprehensive view of the page 
      content, then back up to the relevant part to continue your work.

      If necessary, you can use the mouse to click and drag to select text and/or leverage shortcuts 
      like Ctrl+A, Ctrl+C, and Ctrl+V, Windows+Arrow Keys, or Windows+D.

      If you are working in a browser and the current tab contains information relevant to the task,
      create a new tab before proceeding to avoid losing that context. You can use 
      Ctrl+T to open a new tab. If you need to zoom in/out to see details, use Windows+Plus or Windows+-.

      Consider any context from previous tasks that might be relevant to the current task. If there
      are related tasks or information from earlier interactions, incorporate that knowledge into
      your approach. Before calling finish_run, carefully review all requirements and success criteria
      to ensure nothing has been overlooked.

      You should always call a tool! Always return a tool call. Remember to call the finish_run tool 
      when you have achieved the goal of the task. Do not explain you have finished the task, just 
      call the tool. Use keyboard shortcuts to navigate whenever possible.
    `,
    messages: historyWithoutImages as BetaMessageParam[],
    betas: ['computer-use-2024-10-22'],
  });

  return { content: message.content, role: message.role };
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

// Track both last message and last screenshot
let lastMessage: string | null = null;
let lastScreenshot: string | null = null;

const sendMessage = async (state: AppState, message: string) => {
  if (!message || !message.trim()) {
    return;
  }
  
  if (state.chatSource === 'telegram') {
    lastMessage = message;
  } else {
    console.log(message);
  }
};

// Add function to send last message and screenshot
const sendLastMessage = async (state: AppState) => {
  if (state.chatSource === 'telegram' && state.telegramContext) {
    if (lastScreenshot) {
      // Convert base64 to Buffer for Telegram
      const imageBuffer = Buffer.from(lastScreenshot, 'base64');
      await state.telegramContext.replyWithPhoto({ source: imageBuffer });
    }
    if (lastMessage) {
      await state.telegramContext.reply(lastMessage);
    }
    // Clear after sending
    lastMessage = null;
    lastScreenshot = null;
  }
};

// Add this helper function back
function sanitizeMessageForIPC(message: BetaMessageParam): any {
  if (typeof message.content === 'string') {
    return {
      role: message.role,
      content: message.content
    };
  }

  return {
    role: message.role,
    content: message.content.map(content => {
      if (content.type === 'tool_use') {
        return {
          type: content.type,
          name: content.name,
          input: content.input,
          id: content.id
        };
      }
      if (content.type === 'tool_result') {
        return {
          type: content.type,
          tool_use_id: content.tool_use_id,
          content: content.content?.map(c => {
            if (c.type === 'image') {
              return {
                type: c.type,
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: c.source.data
                }
              };
            }
            return c;
          })
        };
      }
      return content;
    })
  };
}

export const runAgent = async (
  setState: (state: AppState) => void,
  getState: () => AppState,
) => {
  // Clear tracked messages at start
  lastMessage = null;
  lastScreenshot = null;
  
  setState({
    ...getState(),
    running: true,
    runHistory: [{ 
      role: 'user', 
      content: getState().instructions ?? '' 
    }],
    error: null,
  });

  while (getState().running) {
    if (getState().runHistory.length >= MAX_STEPS * 2) {
      const errorMsg = 'Maximum steps exceeded';
      setState({
        ...getState(),
        error: errorMsg,
        running: false,
      });
      await sendMessage(getState(), errorMsg);
      await sendLastMessage(getState());
      break;
    }

    try {
      const message = await promptForAction(getState().runHistory);
      
      const { action, reasoning, toolId } = extractAction(message as BetaMessage);
      
      if (reasoning && reasoning.trim()) {
        await sendMessage(getState(), reasoning);
      }

      setState({
        ...getState(),
        runHistory: [...getState().runHistory, sanitizeMessageForIPC(message)],
      });

      if (action.type === 'error') {
        setState({
          ...getState(),
          error: action.message,
          running: false,
        });
        if (action.message) {
          await sendMessage(getState(), `Error: ${action.message}`);
        }
        await sendLastMessage(getState());
        break;
      } else if (action.type === 'finish') {
        setState({
          ...getState(),
          running: false,
        });
        await sendMessage(getState(), 'Task completed successfully!');
        await sendLastMessage(getState());
        break;
      }
      
      if (!getState().running) {
        await sendMessage(getState(), 'Operation stopped by user.');
        await sendLastMessage(getState());
        break;
      }

      await hideWindowBlock(() => performAction(action));

      await new Promise((resolve) => setTimeout(resolve, 500));
      if (!getState().running) {
        await sendLastMessage(getState());
        break;
      }

      // Take screenshot and update state
      const screenshot = await getScreenshot();
      lastScreenshot = screenshot; // Store the last screenshot
      
      const screenshotMessage = {
        role: 'user' as const,
        content: [
          {
            type: 'tool_result' as const,
            tool_use_id: toolId,
            content: [
              {
                type: 'text' as const,
                text: 'Here is a screenshot after the action was executed',
              },
              {
                type: 'image' as const,
                source: {
                  type: 'base64' as const,
                  media_type: 'image/png',
                  data: screenshot,
                },
              },
            ],
          },
        ],
      };

      setState({
        ...getState(),
        runHistory: [...getState().runHistory, sanitizeMessageForIPC(screenshotMessage as BetaMessageParam)],
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'An unknown error occurred';
      setState({
        ...getState(),
        error: errorMsg,
        running: false,
      });
      await sendMessage(getState(), `Error: ${errorMsg}`);
      await sendLastMessage(getState());
      break;
    }
  }
};
