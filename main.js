const { app, BrowserWindow } = require('electron');
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

app.whenReady().then(async () => {
  const specs = await detectAll();
  console.log('\n=== AICHECK — detected specs ===');
  console.log(JSON.stringify(specs, null, 2));
  console.log('================================\n');

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
