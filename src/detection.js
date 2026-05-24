const si = require('systeminformation');

const TIMEOUT_MS = 5000;

function withTimeout(promise) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
  );
  return Promise.race([promise, timeout]);
}

async function getOS() {
  try {
    const info = await withTimeout(si.osInfo());
    return {
      platform: info.platform || 'Unknown',
      distro: info.distro || 'Unknown',
      release: info.release || 'Unknown',
      arch: info.arch || 'Unknown',
    };
  } catch {
    return { platform: 'Unknown', distro: 'Unknown', release: 'Unknown', arch: 'Unknown' };
  }
}

async function getRAM() {
  try {
    const mem = await withTimeout(si.mem());
    return {
      totalGB: mem.total ? +(mem.total / 1073741824).toFixed(1) : 'Unknown',
    };
  } catch {
    return { totalGB: 'Unknown' };
  }
}

async function getRAMLayout() {
  try {
    const layout = await withTimeout(si.memLayout());
    if (!layout || layout.length === 0) return { type: 'Unknown', speedMHz: 'Unknown' };
    const first = layout[0];
    return {
      type: first.type || 'Unknown',
      speedMHz: first.clockSpeed || 'Unknown',
    };
  } catch {
    return { type: 'Unknown', speedMHz: 'Unknown' };
  }
}

async function getDisk() {
  try {
    const drives = await withTimeout(si.fsSize());
    if (!drives || drives.length === 0) return { freeGB: 'Unknown', totalGB: 'Unknown' };
    const main = drives.reduce((a, b) => (b.available > a.available ? b : a));
    return {
      freeGB: +(main.available / 1073741824).toFixed(1),
      totalGB: +(main.size / 1073741824).toFixed(1),
    };
  } catch {
    return { freeGB: 'Unknown', totalGB: 'Unknown' };
  }
}

async function getCPU() {
  try {
    const cpu = await withTimeout(si.cpu());
    return {
      model: cpu.brand || 'Unknown',
      arch: cpu.physicalCores ? (cpu.physicalCores > 0 ? '64-bit' : 'Unknown') : 'Unknown',
      cores: cpu.physicalCores || 'Unknown',
    };
  } catch {
    return { model: 'Unknown', arch: 'Unknown', cores: 'Unknown' };
  }
}

async function getGPU() {
  try {
    const graphics = await withTimeout(si.graphics());
    if (!graphics || !graphics.controllers || graphics.controllers.length === 0) {
      return { model: 'Unknown' };
    }
    return { model: graphics.controllers[0].model || 'Unknown' };
  } catch {
    return { model: 'Unknown' };
  }
}

async function detectAll() {
  const [os, ram, ramLayout, disk, cpu, gpu] = await Promise.all([
    getOS(),
    getRAM(),
    getRAMLayout(),
    getDisk(),
    getCPU(),
    getGPU(),
  ]);
  return { os, ram, ramLayout, disk, cpu, gpu };
}

module.exports = { detectAll };
