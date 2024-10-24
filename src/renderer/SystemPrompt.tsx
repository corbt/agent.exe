import React, { useState } from 'react';
import {
  Box,
  Button,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { useDispatch } from 'zutron';
import { useStore } from './hooks/useStore';

const DEFAULT_SYSTEM_PROMPT = `The user will ask you to perform a task and you should use their computer to do so. After each step, take a screenshot and carefully evaluate if you have achieved the right outcome. Explicitly show your thinking: "I have evaluated step X..." If not correct, try again. Only when you confirm a step was executed correctly should you move on to the next one. Note that you have to click into the browser address bar before typing a URL. You should always call a tool! Always return a tool call. Remember call the finish_run tool when you have achieved the goal of the task. Do not explain you have finished the task, just call the tool. Use keyboard shortcuts to navigate whenever possible.`;

export function SystemPrompt() {
  const dispatch = useDispatch(window.zutron);
  const { systemPrompt } = useStore();
  const [localSystemPrompt, setLocalSystemPrompt] = useState(systemPrompt);

  const handleSave = () => {
    dispatch({ type: 'SET_SYSTEM_PROMPT', payload: localSystemPrompt });
  };

  const applyDefaultPrompt = () => {
    setLocalSystemPrompt(DEFAULT_SYSTEM_PROMPT);
  };

  return (
    <VStack spacing={4} align="stretch" width="100%" height="100%">
      <Textarea
        value={localSystemPrompt}
        onChange={(e) => setLocalSystemPrompt(e.target.value)}
        placeholder="Enter system prompt here..."
        size="sm"
        resize="vertical"
        minHeight="200px"
        height="calc(100% - 80px)"  // Adjust this value as needed
      />
      <Box>
        <Button onClick={applyDefaultPrompt} colorScheme="teal" mr={3}>
          Apply Default Prompt
        </Button>
        <Button onClick={handleSave} colorScheme="blue">
          Save
        </Button>
      </Box>
    </VStack>
  );
}
