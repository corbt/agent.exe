import React, { useState } from 'react';
import { Box, Button, Input, HStack } from '@chakra-ui/react';
import { useDispatch } from 'zutron';

export function ContinuousInput() {
  const [input, setInput] = useState('');
  const dispatch = useDispatch(window.zutron);

  const handleSubmit = () => {
    if (input.trim()) {
      dispatch({ type: 'ADD_USER_INPUT', payload: input });
      setInput('');
    }
  };

  return (
    <Box>
      <HStack>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter additional instructions..."
        />
        <Button onClick={handleSubmit}>Submit</Button>
      </HStack>
    </Box>
  );
}
