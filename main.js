const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs   = require('fs');
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

// Renderer asks to save a PDF → show save dialog, generate PDF, write file
ipcMain.handle('save-pdf', async (event) => {
  const { filePath, canceled } = await dialog.showSaveDialog({
    title: 'Save AICHECK report',
    defaultPath: path.join(app.getPath('documents'), 'AICHECK-report.pdf'),
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });

  if (canceled || !filePath) return { success: false, canceled: true };

  try {
    const pdfData = await event.sender.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      landscape: false,
    });
    await fs.promises.writeFile(filePath, pdfData);
    shell.showItemInFolder(filePath);
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
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
