import { Telegraf } from 'telegraf';
import { Store } from '../store';
import { TELEGRAM_BOT_TOKEN } from './config';
import { store } from '../store/create';

export function createTelegramBot(store: Store) {
  const bot = new Telegraf(TELEGRAM_BOT_TOKEN!); // Assert token exists since we check in config.ts

  bot.command('start', (ctx) => {
    ctx.reply('Welcome! Send me instructions and I will help you automate tasks on the computer.');
  });

  bot.command('run', async (ctx) => {
    const text = ctx.message.text.split('/run ')[1];
    if (!text) {
      ctx.reply('Please provide instructions after /run command');
      return;
    }

    store.setState((state) => ({
      ...state,
      instructions: text,
      chatSource: 'telegram',
      telegramContext: ctx,
    }));
    
    try {
      await store.getState().RUN_AGENT();
    } catch (err) {
      ctx.reply(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      // Clear telegram context after run
      store.setState((state) => ({
        ...state,
        telegramContext: null,
        chatSource: 'local',
      }));
    }
  });

  bot.command('stop', (ctx) => {
    store.getState().STOP_RUN();
    ctx.reply('Stopped current automation');
  });

  bot.command('status', (ctx) => {
    const { running, instructions } = store.getState();
    ctx.reply(
      `Status:\nRunning: ${running}\nCurrent instructions: ${instructions || 'None'}`
    );
  });

  return bot;
}
