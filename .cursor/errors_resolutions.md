# Errors and Resolutions

**Top Mistakes to Avoid:**

1. **Always maintain the correct return format in API response handling:** Ensure that the `promptForAction` function always returns an object with `content` and `role` properties, matching the expected `BetaMessageParam` type.
2. **Use only allowed message roles:** When working with the Anthropic API, ensure that only 'user' and 'assistant' roles are used in the conversation history.
3. **Be cautious of plugin loading and display logic:** Ensure that plugins are loaded only once and displayed correctly in the UI.

# Error # 1...

# Error # 2: Incorrect Return Format in promptForAction

**Error Description:**
The `promptForAction` function was inadvertently modified to return the raw API response instead of the expected `BetaMessageParam` format.

**Resolution:**
Restored the correct return statement in the `promptForAction` function:
```typescript
return { content: message.content, role: message.role };
```

**Lessons Learned:**
- Always double-check the return types and formats when modifying functions, especially those interfacing with external APIs.
- Maintain consistency with the defined types and interfaces throughout the codebase.
- When making changes, ensure that all parts of the function, including the return statement, are updated accordingly.

# Error # 3: Unexpected 'tool' Role in Message History

**Error Description:**
The Anthropic API returned an error stating "Unexpected role 'tool'. Allowed roles are 'user' or 'assistant'." This occurred because the conversation history included messages with a 'tool' role, which is not supported by the current version of the API.

**Resolution:**
1. Updated the `runAgent` function to filter out any messages with 'tool' role before sending to `promptForAction`:
```typescript
const filteredHistory = getState().runHistory.filter(msg => msg.role === 'user' || msg.role === 'assistant');
const message = await promptForAction(filteredHistory, getState().systemPrompt);
```
2. Ensured that tool use and tool results are included as part of 'assistant' messages in the conversation history.
3. Updated the `AppMessage` type in `types.ts` to only allow 'user' and 'assistant' roles:
```typescript
export type AppMessage = {
  role: 'user' | 'assistant';
  content: string | BetaMessageParam['content'];
};
```

**Lessons Learned:**
- Stay up-to-date with API documentation and requirements, as they may change over time.
- Implement proper type checking and validation to ensure that only allowed message roles are used in the conversation history.
- When working with external APIs, always validate the data structure before sending requests to avoid unexpected errors.

# Error # 4: Duplicate Plugin Display in UI

**Error Description:**
After restarting the application, installed plugins were being displayed twice in the UI, despite only being installed once.

**Resolution:**
1. Updated the `pluginManager.ts` file to clear existing plugins before loading:
```typescript
loadPlugins() {
  console.log(`Attempting to load plugins from: ${this.pluginsDir}`);
  this.plugins = []; // Clear existing plugins before loading
  // ... rest of the loading logic
}
```
2. Simplified the `Plugins.tsx` component to directly use the plugin list received from the main process:
```typescript
export function Plugins() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);

  useEffect(() => {
    const removeListener = window.electron.ipcRenderer.on('get-plugins-response', (installedPlugins) => {
      setPlugins(installedPlugins as Plugin[]);
    });

    window.electron.ipcRenderer.sendMessage('get-plugins');

    return () => {
      removeListener();
    };
  }, []);

  // ... rest of the component
}
```

**Lessons Learned:**
- Be cautious of state management in both the main process and renderer process, especially when dealing with persistent data like plugins.
- Implement clear loading and resetting mechanisms for data that persists across app restarts.
- Use console logging strategically to track the flow of data and identify points of duplication or unexpected behavior.
- Always test the application's behavior after a restart to catch issues related to persistent data or state management.
