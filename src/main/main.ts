/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { app, ipcMain } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import { mainZustandBridge } from 'zutron/main';
import { createMainWindow } from './window';
import { store } from './store/create';
import { resolveHtmlPath } from './util';
import { OpenAI } from 'openai';
import fs from 'fs';

const openai = new OpenAI();

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.handle('stt', async (event, arrayBuffer) => {
  try {
    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(arrayBuffer);

    // Save the audio data to a temporary file
    const tempFilePath = path.join(__dirname, 'temp_recording.webm');
    console.error('tempFilePath:', tempFilePath);
    fs.writeFileSync(tempFilePath, buffer);

    // Read the file as a stream
    const fileStream = fs.createReadStream(tempFilePath);

    // Call the OpenAI API
    const response = await openai.audio.transcriptions.create(
      { file: fileStream, model: 'whisper-1' }, // Model name
    );

    // Delete the temporary file
    fs.unlinkSync(tempFilePath);

    // Send the transcription back to the renderer process
    return response.text;
  } catch (error: any) {
    console.error('Error during speech-to-text conversion:', error);
    event.sender.send('stt-result', `Error: ${error.message}`);
  }
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')({ showDevTools: false });
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const initializeApp = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const mainWindow = await createMainWindow(getAssetPath);

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();

  const { unsubscribe } = mainZustandBridge(ipcMain, store, [mainWindow], {
    // reducer: rootReducer,
  });

  app.on('quit', unsubscribe);
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(async () => {
    await initializeApp();
  })
  .catch(console.log);
