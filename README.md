# Agent.exe: Claude's Computer Control Interface

[📊 View Project Progress Report](progress_report.md)
[🗺️ View Project Plan](.cursor/plan.md)

Presenting **Agent.exe**: the easiest way to let Claude's new [computer use](https://www.anthropic.com/news/3-5-models-and-computer-use) capabilities take over your computer!

<img width="387" alt="buy pizza" src="https://github.com/user-attachments/assets/c11cc8f1-6dcb-48f4-9d18-682f14edb77d">

https://github.com/user-attachments/assets/2a371241-bc43-46d4-896e-256b3adc388d

## Recent Updates

We've made significant improvements to Agent.exe. Here are some of the latest updates:

![Update 1: System Prompt Configuration](update1.png)

We've added a new "System Prompt" tab that allows users to customize the instructions given to Claude. This gives you more control over how Claude interacts with your computer.

![Update 2: Continuous Input and Run History](update2.png)

The main interface now includes a continuous input box for providing additional instructions to Claude during a run. We've also improved the run history display to show Claude's actions and reasoning more clearly.

## ORIGINAL PROJECT 👇

### Motivation

I wanted to see how good Claude's new [computer use](https://www.anthropic.com/news/3-5-models-and-computer-use) APIs were, and the default project they provided felt too heavyweight. This is a simple Electron app that lets Claude 3.5 Sonnet control your local computer directly. I was planning on adding a "semi-auto" mode where the user has to confirm each action before it executes, but each step is so slow I found that wasn't necessary and if the model is getting confused you can easily just hit the "stop" button to end the run.

### Getting started

1.  `git clone https://github.com/corbt/agent.exe`
2.  `cd agent.exe`
3.  `npm install`
4.  Rename `.env.example` --> `.env` and add your Anthropic API Key
5.  `npm start`
6.  Prompt the model to do something interesting on your computer!

### Supported systems

- MacOS
- Theoretically Windows and Linux since all the deps are cross-platform

### Known limitations

- Only works on the primary display
- Lets an AI completely take over your computer
- Oh jeez, probably lots of other stuff too

### Tips

- Claude _really_ likes Firefox. It will use other browsers if it absolutely has to, but will behave so much better if you just install Firefox and let it go to its happy place.

### Roadmap

- I literally wrote this in 6 hours, probably isn't going anywhere. But I will review PRs and merge them if they seem cool.

## Shannon Code Fork
