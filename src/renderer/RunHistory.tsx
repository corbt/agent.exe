import { Box, Image } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useStore } from './hooks/useStore';
import { extractAction } from '../main/store/extractAction';

export function RunHistory() {
  const { runHistory } = useStore();

  const messages = runHistory
    .filter((m) => m.role === 'assistant' || (m.role === 'user' && Array.isArray(m.content)));

  useEffect(() => {
    const element = document.getElementById('run-history');
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages]); // Scroll when messages change

  if (runHistory.length === 0) return null;

  return (
    <Box
      id="run-history" // Add ID for scrolling
      w="100%"
      h="100%"
      bg="white"
      borderRadius="16px"
      border="1px solid"
      borderColor="rgba(112, 107, 87, 0.5)"
      p={4}
      overflow="auto"
    >
      {messages.map((message, index) => {
        if (message.role === 'assistant') {
          const action = extractAction(message);
          return (
            <Box key={index} mb={4} p={3} borderRadius="md" bg="gray.50">
              <Box mb={2} fontSize="sm" color="gray.600">
                {action.reasoning}
              </Box>
              <Box fontFamily="monospace" color="blue.600">
                {action.action.type}({JSON.stringify(action.action)})
              </Box>
            </Box>
          );
        } else if (Array.isArray(message.content)) {
          const imageContent = message.content.find(
            (item) => item.type === 'tool_result' && Array.isArray(item.content)
          );
          if (imageContent && Array.isArray(imageContent.content)) {
            const imageItem = imageContent.content.find((item) => item.type === 'image');
            if (imageItem && imageItem.source && imageItem.source.type === 'base64') {
              return (
                <Box key={index} mb={4}>
                  <Image
                    src={`data:image/png;base64,${imageItem.source.data}`}
                    alt="Screenshot"
                    borderRadius="md"
                  />
                </Box>
              );
            }
          }
        }
        return null;
      })}
    </Box>
  );
}
