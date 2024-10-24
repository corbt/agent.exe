# Agent.exe Project Plan

## Project Overview

Agent.exe is an Electron-based application that allows Claude 3.5 Sonnet, an AI model, to control a user's local computer directly. The project aims to showcase and utilize Claude's computer use capabilities in a lightweight, user-friendly interface.

## Project Directory

```
Agent.exe/
├── .cursor/                      # Directory for cursor-related files
│   ├── instructions.md           # Instructions for the development process
│   ├── current_status.md         # Current status of the project
│   └── plan.md                   # Project plan and roadmap
├── .erb/                         # Electron React Boilerplate configurations
│   └── configs/                  # Webpack and other build configurations
│       └── webpack.config.main.dev.ts  # Webpack config for main process development
├── assets/                       # Static assets like images and icons
├── release/                      # Build output directory
│   └── app/                      # Application package directory
│       └── package.json          # Package configuration for the built app
├── src/                          # Source code directory
│   ├── main/                     # Main process code
│   │   ├── main.ts               # Entry point for the main process
│   │   ├── preload.ts            # Preload script for renderer process
│   │   ├── settings.ts           # Manage application settings
│   │   └── store/                # State management for main process
│   │       ├── create.ts         # Store creation and configuration
│   │       ├── runAgent.ts       # Logic for running the AI agent
│   │       └── types.ts          # TypeScript type definitions
│   └── renderer/                 # Renderer process code
│       ├── App.tsx               # Main React component
│       ├── index.ejs             # HTML template for the app
│       ├── index.tsx             # Entry point for the renderer process
│       ├── RunHistory.tsx        # Component for displaying run history
│       ├── SystemPrompt.tsx      # Component for system prompt configuration
│       ├── FeedbackRequest.tsx   # Component for handling user feedback requests
│       ├── ContinuousInput.tsx   # Component for continuous user input
│       ├── global.d.ts           # Global type declarations
│       └── hooks/                # Custom React hooks
│           └── useStore.ts       # Hook for accessing the Zustand store
├── .editorconfig                 # Editor configuration for consistent coding styles
├── .env                          # Environment variables (not tracked in git)
├── .eslintignore                 # Files to be ignored by ESLint
├── .eslintrc                     # ESLint configuration
├── .gitignore                    # Git ignore file
├── package.json                  # Node.js dependencies and scripts
├── README.md                     # Project documentation and overview
└── tsconfig.json                 # TypeScript configuration
```

## Current Features

1. Direct computer control by Claude 3.5 Sonnet
2. Real-time execution of AI-generated commands
3. Simple Electron-based user interface
4. Support for MacOS (with theoretical support for Windows and Linux)
5. Primary display interaction
6. Emergency stop functionality

## Planned Enhancements

### 1. Persistent Settings

- Implement a settings storage system that saves user preferences across application restarts
- Utilize Electron's `electron-store` or a similar library for efficient local storage

### 2. System Prompt Configuration

- Add a new tab or section in the UI for users to input and edit system prompts
- Store and load system prompts as part of the persistent settings

### 3. Enhanced Logging with Images

- Modify the `RunHistory` component to include image support
- Capture and display screenshots of actions performed by the AI
- Implement an image storage and retrieval system

### 4. Plugin System

- Design and implement a plugin architecture to extend the application's functionality
- Create a plugin loader and manager
- Develop a standardized plugin API for third-party developers

### 5. Window State Persistence

- Save and restore the application window's size and position between restarts
- Utilize Electron's `electron-window-state` or a custom implementation

### 6. Session Management

- Implement functionality to save the current message stack as a "session"
- Create a session loading mechanism
- Design a user interface for managing (saving, loading, deleting) sessions

### 7. Configurable Tools System

- Develop a tool configuration interface in the settings
- Implement a tool management system that can launch, close, and manage tool state
- Create a screenshot masking system to focus on the active tool
- Pass tool context to the AI model

### 8. User Feedback and Continuous Input System

- Implement an always-present input box for users to provide additional instructions
- Create a mechanism for the AI to incorporate new instructions into its ongoing task
- Integrate the continuous input system with the existing run history

## Implementation Plan

### 1. Persistent Settings

1. Install `electron-store` or a similar library
2. Create a `settings.ts` file to manage application settings
3. Modify the main process to load and save settings
4. Update the renderer process to reflect and modify settings

### 2. System Prompt Configuration

1. Add a new React component for system prompt input
2. Modify the store to include system prompt state
3. Update the AI interaction logic to incorporate the system prompt

### 3. Enhanced Logging with Images

1. Modify the `RunHistory` component to support image display
2. Update the `runAgent` function to capture screenshots after each action
3. Implement an image storage system using the file system or a lightweight database

### 4. Plugin System

1. Design the plugin API and architecture
2. Create a plugin loader in the main process
3. Implement a plugin manager to handle plugin lifecycle
4. Develop a UI for enabling/disabling plugins

### 5. Window State Persistence

1. Install `electron-window-state` or implement a custom solution
2. Modify the main process to save and restore window state
3. Update the `createWindow` function to use the saved state

### 6. Session Management

1. Design the session data structure
2. Implement save and load functions for sessions
3. Create a UI for session management (list, save, load, delete)
4. Modify the store to handle session state

### 7. Configurable Tools System

1. Design the tool configuration data structure
2. Create a UI for tool configuration in the settings
3. Implement a tool management system in the main process
4. Modify the `runAgent` function to handle tool context and management
5. Develop a screenshot masking system for active tools

### 8. User Feedback and Continuous Input System

1. Design the continuous input data structure and integration with the existing message stack
2. Create a persistent UI component for the input box in the main application window
3. Implement a mechanism in the main process to handle new user inputs
4. Modify the `runAgent` function to check for and incorporate new user inputs during execution
5. Update the renderer process to display the input box and send new instructions to the main process
6. Integrate the new input system with the existing run history display
