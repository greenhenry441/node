const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const fs = require('fs/promises');
const path = require('path');

const APP_URL = process.env.NODE_FMS_URL || 'https://nodefms.lovable.app';
const APP_NAME = 'Node FMS';
const EDITOR_PATH = '/editor';

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: APP_NAME,
    backgroundColor: '#06070d',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    autoHideMenuBar: process.platform !== 'darwin',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  mainWindow.loadURL(APP_URL);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(APP_URL)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.webContents.on('will-navigate', (e, url) => {
    const target = new URL(url);
    const base = new URL(APP_URL);
    if (target.origin !== base.origin) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

function goToEditor() {
  if (!mainWindow) return;
  mainWindow.loadURL(`${APP_URL}${EDITOR_PATH}`);
}

function sendMenu(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload);
  }
}

// ---- File IPC ----
ipcMain.handle('nodefms:open-file', async () => {
  const res = await dialog.showOpenDialog(mainWindow, {
    title: 'Open file in Node FMS',
    properties: ['openFile'],
    filters: [
      { name: 'Text & code', extensions: ['txt','md','json','js','ts','tsx','jsx','css','html','yml','yaml','csv','log','env','toml','xml','sql'] },
      { name: 'All files', extensions: ['*'] },
    ],
  });
  if (res.canceled || !res.filePaths[0]) return null;
  const filePath = res.filePaths[0];
  const content = await fs.readFile(filePath, 'utf8');
  return { filePath, content, name: path.basename(filePath) };
});

ipcMain.handle('nodefms:read-file', async (_e, filePath) => {
  const content = await fs.readFile(filePath, 'utf8');
  return { filePath, content, name: path.basename(filePath) };
});

ipcMain.handle('nodefms:save-file', async (_e, { filePath, content }) => {
  if (!filePath) throw new Error('No file path');
  await fs.writeFile(filePath, content, 'utf8');
  return { filePath, savedAt: Date.now() };
});

ipcMain.handle('nodefms:save-file-as', async (_e, { content, suggestedName }) => {
  const res = await dialog.showSaveDialog(mainWindow, {
    title: 'Save file',
    defaultPath: suggestedName || 'untitled.txt',
  });
  if (res.canceled || !res.filePath) return null;
  await fs.writeFile(res.filePath, content, 'utf8');
  return { filePath: res.filePath, savedAt: Date.now() };
});

function buildMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: 'File',
      submenu: [
        { label: 'New File', accelerator: 'CmdOrCtrl+N', click: () => { goToEditor(); setTimeout(() => sendMenu('menu:new'), 400); } },
        { label: 'Open File…', accelerator: 'CmdOrCtrl+O', click: () => { goToEditor(); setTimeout(() => sendMenu('menu:open'), 400); } },
        { type: 'separator' },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => sendMenu('menu:save') },
        { label: 'Save As…', accelerator: 'Shift+CmdOrCtrl+S', click: () => sendMenu('menu:save-as') },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' },
      ],
    },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        { label: 'Home', accelerator: 'CmdOrCtrl+H', click: () => mainWindow?.loadURL(APP_URL) },
        { label: 'Editor', accelerator: 'CmdOrCtrl+E', click: goToEditor },
        { label: 'Reload', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.reload() },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { role: 'toggleDevTools' },
      ],
    },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [
        {
          label: 'About Node FMS',
          click: () => dialog.showMessageBox({
            type: 'info',
            title: 'About Node FMS',
            message: APP_NAME,
            detail: `Version ${app.getVersion()}\nDesktop client for Node FMS.\nNative file open & edit enabled.\n${APP_URL}`,
          }),
        },
        { label: 'GitHub', click: () => shell.openExternal('https://github.com/greenhenry441/NodeFMS') },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  buildMenu();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
