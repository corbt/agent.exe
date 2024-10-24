import React, { useEffect, useState } from 'react';
import { Box, VStack, Text, Heading, Button } from '@chakra-ui/react';

interface Plugin {
  name: string;
}

export function Plugins() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);

  const fetchPlugins = () => {
    window.electron.ipcRenderer.sendMessage('get-plugins');
  };

  useEffect(() => {
    fetchPlugins();

    const removeListener = window.electron.ipcRenderer.on('get-plugins-response', (installedPlugins) => {
      setPlugins(installedPlugins as Plugin[]);
    });

    return () => {
      removeListener();
    };
  }, []);

  const handleInstallPlugin = () => {
    window.electron.ipcRenderer.sendMessage('install-plugin');
  };

  useEffect(() => {
    const removeListener = window.electron.ipcRenderer.on('install-plugin-response', (success) => {
      if (success) {
        fetchPlugins();
      }
    });

    return () => {
      removeListener();
    };
  }, []);

  return (
    <VStack spacing={4} align="stretch">
      <Heading size="md">Installed Plugins</Heading>
      {plugins.map((plugin, index) => (
        <Box key={index} p={3} borderWidth={1} borderRadius="md">
          <Text>{plugin.name}</Text>
        </Box>
      ))}
      <Button onClick={handleInstallPlugin}>Install Plugin</Button>
    </VStack>
  );
}
