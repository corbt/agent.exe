import React, { useState } from 'react';
import { Box, Button, Input, Text, VStack } from '@chakra-ui/react';
import { FeedbackRequest as FeedbackRequestType, FeedbackResponse } from '../main/store/types';

type Props = {
  request: FeedbackRequestType;
  onSubmit: (response: FeedbackResponse) => void;
};

export function FeedbackRequest({ request, onSubmit }: Props) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    onSubmit({ id: request.id, answer });
  };

  return (
    <Box>
      <VStack spacing={4}>
        <Text>{request.question}</Text>
        <Input value={answer} onChange={(e) => setAnswer(e.target.value)} />
        <Button onClick={handleSubmit}>Submit Feedback</Button>
      </VStack>
    </Box>
  );
}
