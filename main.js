const { app, BrowserWindow } = require('electron');
const path = require('path');
const { detectAll } = require('./src/detection');
const { evaluate } = require('./src/recommendations');

// PHASE 3 TEST — remove in Phase 7
function runRecommendationTests() {
  const mockGreen = {
    os:        { platform: 'win32', distro: 'Windows 11 Pro', release: '10.0.22621', arch: 'x64' },
    ram:       { totalGB: 32 },
    ramLayout: { type: 'DDR5', speedMHz: 5600 },
    disk:      { freeGB: 100, totalGB: 500 },
    cpu:       { model: 'Intel Core i9-13900K', cores: 16 },
    gpu:       { model: 'NVIDIA RTX 4080' },
  };
  const mockYellow = {
    os:        { platform: 'win32', distro: 'Windows 10 Pro', release: '10.0.19041', arch: 'x64' },
    ram:       { totalGB: 12 },
    ramLayout: { type: 'DDR4', speedMHz: 3200 },
    disk:      { freeGB: 30, totalGB: 256 },
    cpu:       { model: 'Intel Core i7-8750H', cores: 6 },
    gpu:       { model: 'Intel UHD Graphics 630' },
  };
  const mockRed = {
    os:        { platform: 'win32', distro: 'Windows 7', release: '6.1.7601', arch: 'x86' },
    ram:       { totalGB: 2 },
    ramLayout: { type: 'DDR3', speedMHz: 1333 },
    disk:      { freeGB: 3, totalGB: 80 },
    cpu:       { model: 'Intel Core 2 Duo E8400', cores: 2 },
    gpu:       { model: 'Intel GMA 4500' },
  };

  console.log('\n=== PHASE 3 TEST: GREEN ===');
  console.log(JSON.stringify(evaluate(mockGreen), null, 2));
  console.log('\n=== PHASE 3 TEST: YELLOW ===');
  console.log(JSON.stringify(evaluate(mockYellow), null, 2));
  console.log('\n=== PHASE 3 TEST: RED ===');
  console.log(JSON.stringify(evaluate(mockRed), null, 2));
  console.log('\n================================\n');
}

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
  runRecommendationTests();

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
