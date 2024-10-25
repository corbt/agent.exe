import React from 'react';
import {
  Box,
  Button,
  ChakraProvider,
  HStack,
  Heading,
  Link,
  Switch,
  VStack,
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

function Main() {
  const dispatch = useDispatch(window.zutron);

  const [voiceOn, setVoiceOn] = React.useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const [mediaStream, setMediaStream] = React.useState<MediaStream | null>(
    null,
  );

  const {
    instructions: savedInstructions,
    fullyAuto,
    running,
    error,
    runHistory,
  } = useStore();
  // Add local state for instructions
  const [localInstructions, setLocalInstructions] = React.useState(
    savedInstructions ?? '',
  );
  const toast = useToast(); // Add toast hook

  const startRun = () => {
    // Update Zustand state before starting the run
    dispatch({ type: 'SET_INSTRUCTIONS', payload: localInstructions });
    dispatch({ type: 'RUN_AGENT', payload: null });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      startRun();
    }
  };

  const stt = async (audioBlob: Blob) => {
    console.log('stt function called');
    const reader = new FileReader();
    reader.onloadend = async () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      console.log('Invoking stt handler in main process');
      try {
        const result = await window.electron.ipcRenderer.invoke(
          'stt',
          arrayBuffer,
        );
        console.log('Received transcription result:', result);
        setLocalInstructions(result);
      } catch (error) {
        console.error('Error in stt:', error);
        toast({
          description: `Speech-to-text error: ${error.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    reader.readAsArrayBuffer(audioBlob);
  };

  React.useEffect(() => {
    if (navigator.mediaDevices && window.MediaRecorder) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          setMediaStream(stream);

          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (event: BlobEvent) => {
            console.log(
              'ondataavailable event received, data size:',
              event.data.size,
            );
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            console.log(
              'mediaRecorder stopped, audioChunks length:',
              audioChunksRef.current.length,
            );
            const audioBlob = new Blob(audioChunksRef.current, {
              type: 'audio/webm',
            });
            console.log('Created audioBlob:', audioBlob);
            stt(audioBlob);
            audioChunksRef.current = []; // Reset the array for the next recording
          };
        })
        .catch((error) => {
          console.error('Error accessing microphone: ', error);
          toast({
            description: `Error accessing microphone: ${error.message}`,
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        });
    } else {
      console.warn('MediaRecorder is not supported in this browser.');
      toast({
        description: 'MediaRecorder is not supported in this browser.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  React.useEffect(() => {
    if (voiceOn) {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === 'inactive'
      ) {
        mediaRecorderRef.current.start();
      }
    } else {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === 'recording'
      ) {
        mediaRecorderRef.current.stop();
      }
    }
  }, [voiceOn]);

  return (
    <Box
      position="relative"
      w="100%"
      h="100vh"
      p={4}
      sx={{
        '-webkit-app-region': 'drag', // Make the background draggable
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
            // Make all direct children non-draggable
            '-webkit-app-region': 'no-drag',
          },
        }}
      >
        <Box
          as="textarea"
          placeholder="What can I do for you today?"
          width="100%"
          height="auto"
          minHeight="48px"
          p={4}
          borderRadius="16px"
          border="1px solid"
          borderColor="rgba(112, 107, 87, 0.5)"
          verticalAlign="top"
          resize="none"
          overflow="hidden"
          sx={{
            '-webkit-app-region': 'no-drag',
            transition: 'box-shadow 0.2s, border-color 0.2s',
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
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onKeyDown={handleKeyDown}
        />
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
          onClick={() => {
            setVoiceOn(!voiceOn);
          }}
          sx={{
            animation: voiceOn ? 'blinking 1s infinite' : 'none',
            '@keyframes blinking': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0.5 },
              '100%': { opacity: 1 },
            },
          }}
        >
          {voiceOn ? 'Recording' : 'Start Recording'}
        </Button>
        <HStack justify="space-between" align="center" w="100%">
          <HStack spacing={2}>
            <Switch
              isChecked={fullyAuto}
              onChange={(e) => {
                toast({
                  description:
                    "Whoops, automatic mode isn't actually implemented yet. 😬",
                  status: 'info',
                  duration: 3000,
                  isClosable: true,
                });
              }}
            />
            <Box>Full Auto</Box>
          </HStack>
          <HStack>
            {running && <Spinner size="sm" color="gray.500" mr={2} />}
            {!running && runHistory.length > 0 && (
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
                onClick={() => dispatch('CLEAR_HISTORY')}
                aria-label="Clear history"
              >
                <FaTrash />
              </Button>
            )}
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
          </HStack>
        </HStack>

        {/* Add error display */}
        {error && (
          <Box w="100%" color="red.700">
            {error}
          </Box>
        )}

        {/* RunHistory component */}
        <Box flex="1" w="100%" overflow="auto">
          <RunHistory />
        </Box>
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
