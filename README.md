# Agent.exe (Fork)

This is a fork of [corbt/agent.exe](https://github.com/corbt/agent.exe) that adds Telegram bot support for remote control and other improvements.

Presenting **Agent.exe**: the easiest way to let Claude's new [computer use](https://www.anthropic.com/news/3-5-models-and-computer-use) capabilities take over your computer!

<img width="387" alt="buy pizza" src="https://github.com/user-attachments/assets/c11cc8f1-6dcb-48f4-9d18-682f14edb77d">

https://github.com/user-attachments/assets/2a371241-bc43-46d4-896e-256b3adc388d

### What's New in this Fork

- Added Telegram bot support for remote computer control
- Improved error handling and message formatting
- Added recent history context to help Claude maintain task context
- Windows-optimized system prompts

### Motivation

I wanted to see how good Claude's new [computer use](https://www.anthropic.com/news/3-5-models-and-computer-use) APIs were, and the default project they provided felt too heavyweight. This is a simple Electron app that lets Claude 3.5 Sonnet control your local computer directly. I was planning on adding a "semi-auto" mode where the user has to confirm each action before it executes, but each step is so slow I found that wasn't necessary and if the model is getting confused you can easily just hit the "stop" button to end the run.

### Getting started

1.  `git clone https://github.com/YOUR_USERNAME/agent.exe` (replace with your actual repo URL)
2.  `cd agent.exe`
3.  `npm install`
4.  Rename `.env.example` --> `.env` and add your Anthropic API Key
5.  (Optional) To enable Telegram control:
    - Create a new bot with [@BotFather](https://t.me/botfather) and get the bot token
    - Add `TELEGRAM_BOT_TOKEN=your_bot_token` to your `.env` file
    - Start chatting with your bot and use `/run <instructions>` to control your computer remotely
6.  `npm start`
7.  Prompt the model to do something interesting on your computer!

### Supported systems

- MacOS
- Theoretically Windows and Linux since all the deps are cross-platform
- Note: The current system prompt is optimized for Windows shortcuts (Win key, etc). You may need to modify the prompt for optimal performance on other operating systems.

### Known limitations

- Only works on the primary display
- Lets an AI completely take over your computer
- System prompt assumes Windows keyboard shortcuts
- Oh jeez, probably lots of other stuff too

### Tips

- Claude _really_ likes Firefox. It will use other browsers if it absolutely has to, but will behave so much better if you just install Firefox and let it go to its happy place.
- When using Telegram control, the bot will send you the final screenshot and status message when the task is complete

### Roadmap

- Update system prompt to be more OS-agnostic or add OS detection
- Add support for multiple displays
- Improve error handling and recovery
- Add more Telegram bot commands and features

### Credits

Original project by [Kyle Corbitt](https://github.com/corbt)
