// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer } from 'electron';
import { preloadZustandBridge } from 'zutron/preload';

import type { AppState } from './store/types';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      // const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
      //   func(...args);
      // ipcRenderer.on(channel, subscription);

      // return () => {
      //   ipcRenderer.removeListener(channel, subscription);
      // };
      console.error('on:', channel);
      ipcRenderer.on(channel, (event, data) => func(data));
    },
    invoke: (channel: Channels, data: any) => ipcRenderer.invoke(channel, data),
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    removeListener(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.removeListener(channel, func);
    },
  },
  // Add window controls
  windowControls: {
    minimize: () => ipcRenderer.invoke('minimize-window'),
    maximize: () => ipcRenderer.invoke('maximize-window'),
    close: () => ipcRenderer.invoke('close-window'),
  },
};

// Initialize Zutron bridge
const { handlers } = preloadZustandBridge<AppState>(ipcRenderer);

// Expose both electron and zutron handlers
contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('zutron', handlers);

export type ElectronHandler = typeof electronHandler;
