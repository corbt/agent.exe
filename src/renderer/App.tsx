import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  ChakraProvider,
  HStack,
  Heading,
  Link,
  Switch,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  extendTheme,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { FaGithub, FaStop, FaTrash } from 'react-icons/fa';
import { HiMinus, HiX } from 'react-icons/hi';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import { useDispatch } from 'zutron';
import { useStore } from './hooks/useStore';
import { RunHistory } from './RunHistory';
import { SystemPrompt } from './SystemPrompt';
import { FeedbackRequest } from './FeedbackRequest';
import { ContinuousInput } from './ContinuousInput';

function Main() {
  const dispatch = useDispatch(window.zutron);
  const {
    instructions: savedInstructions,
    fullyAuto,
    running,
    error,
    runHistory,
    feedbackRequest,
  } = useStore();
  const [localInstructions, setLocalInstructions] = React.useState(
    savedInstructions ?? '',
  );
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [instructionsHeight, setInstructionsHeight] = useState(48);
  const instructionsRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Load saved instructions height
    const savedHeight = localStorage.getItem('instructionsHeight');
    if (savedHeight) {
      setInstructionsHeight(parseInt(savedHeight, 10));
    }
  }, []);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  }, [error, toast]);

  const startRun = () => {
    dispatch({ type: 'SET_INSTRUCTIONS', payload: localInstructions });
    dispatch({ type: 'RUN_AGENT', payload: null });
  };

  const clearHistory = () => {
    dispatch({ type: 'CLEAR_HISTORY', payload: null });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      startRun();
    }
  };

  const handleFullyAutoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    dispatch({ type: 'SET_FULLY_AUTO', payload: newValue });
  };

  const handleInstructionsResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const height = e.target.scrollHeight;
    setInstructionsHeight(height);
    localStorage.setItem('instructionsHeight', height.toString());
    e.target.style.height = `${height}px`;
  };

  return (
    <Box
      position="relative"
      w="100%"
      h="100vh"
      p={4}
      sx={{
        '-webkit-app-region': 'drag',
      }}
    >
      {/* Title heading no longer needs drag property since parent is draggable */}
      <Box position="absolute" top={2} left={6}>
        <Heading fontFamily="Garamond, serif" fontWeight="hairline">
          Agent.exe
        </Heading>
      </Box>

      {/* Window controls and GitHub button moved together */}
      <HStack
        position="absolute"
        top={2}
        right={2}
        spacing={0}
        sx={{
          '-webkit-app-region': 'no-drag',
        }}
      >
        <Link href="https://github.com/corbt/agent.exe" isExternal>
          <Button variant="ghost" size="sm" aria-label="GitHub" minW={8} p={0}>
            <FaGithub />
          </Button>
        </Link>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => window.electron.windowControls.minimize()}
          minW={8}
          p={0}
        >
          <HiMinus />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => window.electron.windowControls.close()}
          minW={8}
          p={0}
        >
          <HiX />
        </Button>
      </HStack>

      <VStack
        spacing={4}
        align="center"
        h="100%"
        w="100%"
        pt={16}
        sx={{
          '& > *': {
            '-webkit-app-region': 'no-drag',
          },
        }}
      >
        <Tabs index={activeTab} onChange={setActiveTab} width="100%" height="calc(100% - 60px)">
          <TabList>
            <Tab>Main</Tab>
            <Tab>System Prompt</Tab>
          </TabList>

          <TabPanels height="calc(100% - 40px)">
            <TabPanel height="100%">
              <VStack spacing={4} height="100%">
                <Box
                  as="textarea"
                  ref={instructionsRef}
                  placeholder="What can I do for you today?"
                  width="100%"
                  flex="1"
                  minHeight="48px"
                  p={4}
                  borderRadius="16px"
                  border="1px solid"
                  borderColor="rgba(112, 107, 87, 0.5)"
                  sx={{
                    '-webkit-app-region': 'no-drag',
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                    resize: 'none',
                    _hover: {
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    },
                    _focus: {
                      borderColor: 'blackAlpha.500',
                      outline: 'none',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                  value={localInstructions}
                  disabled={running}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                    setLocalInstructions(e.target.value);
                    handleInstructionsResize(e);
                  }}
                  onKeyDown={handleKeyDown}
                />
                
                <Box flex="1" w="100%" overflow="auto">
                  <RunHistory />
                </Box>

                {feedbackRequest && (
                  <FeedbackRequest
                    request={feedbackRequest}
                    onSubmit={(response) => dispatch({ type: 'SUBMIT_FEEDBACK', payload: response })}
                  />
                )}

                <ContinuousInput />
              </VStack>
            </TabPanel>
            <TabPanel height="100%">
              <SystemPrompt />
            </TabPanel>
          </TabPanels>
        </Tabs>

        <HStack justify="space-between" align="center" w="100%">
          <HStack spacing={2}>
            <Switch
              isChecked={fullyAuto}
              onChange={handleFullyAutoChange}
            />
            <Box>Full Auto</Box>
          </HStack>
          <HStack>
            {running && <Spinner size="sm" color="gray.500" mr={2} />}
            <Button
              bg="transparent"
              fontWeight="normal"
              _hover={{
                bg: 'whiteAlpha.500',
                borderColor: 'blackAlpha.300',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
              }}
              _focus={{
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
                outline: 'none',
              }}
              borderRadius="12px"
              border="1px solid"
              borderColor="blackAlpha.200"
              onClick={running ? () => dispatch('STOP_RUN') : startRun}
              isDisabled={!running && localInstructions?.trim() === ''}
            >
              {running ? <FaStop /> : "Let's Go"}
            </Button>
            <Button
              bg="transparent"
              fontWeight="normal"
              _hover={{
                bg: 'whiteAlpha.500',
                borderColor: 'blackAlpha.300',
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
              }}
              _focus={{
                boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
                outline: 'none',
              }}
              borderRadius="12px"
              border="1px solid"
              borderColor="blackAlpha.200"
              onClick={clearHistory}
              leftIcon={<FaTrash />}
            >
              Clear History
            </Button>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );
}

const theme = extendTheme({
  styles: {
    global: {
      body: {
        color: 'rgb(83, 81, 70)',
      },
    },
  },
  components: {
    Switch: {
      baseStyle: {
        track: {
          bg: 'blackAlpha.200',
          _checked: {
            bg: '#c79060',
          },
        },
      },
    },
  },
});

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box bg="rgb(240, 238, 229)" minHeight="100vh">
        <Router>
          <Routes>
            <Route path="/" element={<Main />} />
          </Routes>
        </Router>
      </Box>
    </ChakraProvider>
  );
}
