# Errors and Resolutions

**Top Mistakes to Avoid:**

1. **Always maintain the correct return format in API response handling:** Ensure that the `promptForAction` function always returns an object with `content` and `role` properties, matching the expected `BetaMessageParam` type.
2. **Use only allowed message roles:** When working with the Anthropic API, ensure that only 'user' and 'assistant' roles are used in the conversation history.

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
