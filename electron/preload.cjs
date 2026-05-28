const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('nodeFMS', {
  isDesktop: true,
  version: process.versions.electron,
  platform: process.platform,
  openFile: () => ipcRenderer.invoke('nodefms:open-file'),
  readFile: (filePath) => ipcRenderer.invoke('nodefms:read-file', filePath),
  saveFile: (filePath, content) => ipcRenderer.invoke('nodefms:save-file', { filePath, content }),
  saveFileAs: (content, suggestedName) =>
    ipcRenderer.invoke('nodefms:save-file-as', { content, suggestedName }),
  onMenu: (channel, handler) => {
    const allowed = new Set(['menu:open', 'menu:save', 'menu:save-as', 'menu:new']);
    if (!allowed.has(channel)) return () => {};
    const listener = (_e, payload) => handler(payload);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
});
