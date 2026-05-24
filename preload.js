const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getSpecs:      ()    => ipcRenderer.invoke('get-specs'),
  openExternal:  (url) => ipcRenderer.send('open-external', url),
  savePDF:       ()    => ipcRenderer.invoke('save-pdf'),
  getAppVersion: ()    => ipcRenderer.invoke('get-version'),
});
