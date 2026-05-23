const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { detectAll } = require('./src/detection');

function createWindow() {
  const win = new BrowserWindow({
    width: 720,
    height: 720,
    minWidth: 720,
    minHeight: 720,
    title: 'AICHECK',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile(path.join(__dirname, 'src', 'index.html'));
}

// Renderer asks for specs → run detection and return result
ipcMain.handle('get-specs', async () => {
  return await detectAll();
});

// Renderer asks to open a URL → open in system browser (https/http only)
ipcMain.on('open-external', (event, url) => {
  if (typeof url === 'string' && /^https?:\/\//.test(url)) {
    shell.openExternal(url);
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
