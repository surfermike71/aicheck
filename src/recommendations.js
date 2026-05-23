// Scores RAM against thresholds for each tool
function scoreRAM(totalGB) {
  if (totalGB === 'Unknown') return { code: 'fail', cowork: 'fail' };
  const gb = parseFloat(totalGB);
  return {
    code:   gb >= 8  ? 'pass' : gb >= 4 ? 'warn' : 'fail',
    cowork: gb >= 16 ? 'pass' : gb >= 8 ? 'warn' : 'fail',
  };
}

// Scores free disk space (same threshold for both tools)
function scoreDisk(freeGB) {
  if (freeGB === 'Unknown') return 'fail';
  const gb = parseFloat(freeGB);
  if (gb >= 20) return 'pass';
  if (gb >= 5)  return 'warn';
  return 'fail';
}

// Scores OS compatibility per tool
function scoreOS(os) {
  const { platform, release } = os;
  if (!platform || platform === 'Unknown') return { code: 'fail', cowork: 'fail' };

  if (platform === 'win32') {
    // Windows 10 and 11 both report NT version 10.0.x
    const major = parseInt((release || '0').split('.')[0], 10);
    const isWin10Plus = major >= 10;
    return { code: isWin10Plus ? 'pass' : 'fail', cowork: isWin10Plus ? 'pass' : 'fail' };
  }

  if (platform === 'darwin') {
    const parts = (release || '0').split('.').map(Number);
    const major = parts[0];
    const minor = parts[1] || 0;
    // macOS 10.15+ passes for Claude Code; macOS 12+ passes for Claude Cowork
    const isMojaveOrNewer = major > 10 || (major === 10 && minor >= 15);
    const isMontereyOrNewer = major >= 12;
    return {
      code:   isMojaveOrNewer   ? 'pass' : 'fail',
      cowork: isMontereyOrNewer ? 'pass' : 'fail',
    };
  }

  if (platform === 'linux') {
    // Linux passes for Claude Code only
    return { code: 'pass', cowork: 'fail' };
  }

  return { code: 'fail', cowork: 'fail' };
}

// Scores CPU architecture (no warn state — only pass or fail)
function scoreCPU(arch) {
  if (!arch || arch === 'Unknown') return 'fail';
  const is64bit = ['x64', 'x86_64', 'arm64', 'aarch64'].includes(arch.toLowerCase());
  return is64bit ? 'pass' : 'fail';
}

// Returns the worst status across an array of statuses
function worst(...statuses) {
  if (statuses.includes('fail'))  return 'fail';
  if (statuses.includes('warn'))  return 'warn';
  if (statuses.includes('pass'))  return 'pass';
  return 'fail';
}

// Builds OS-aware fix link for RAM issues
function ramFixLink(platform) {
  if (platform === 'darwin') {
    return { text: 'How to check RAM on a Mac', url: 'https://support.apple.com/en-us/111893' };
  }
  if (platform === 'linux') {
    return { text: 'How to check RAM on Linux', url: 'https://www.linux.com/topic/desktop/5-commands-checking-memory-usage-linux/' };
  }
  return { text: 'How to check RAM on Windows', url: 'https://support.microsoft.com/en-us/windows/how-to-check-ram-in-windows-ae038ee8-cf53-d2a2-d726-e06e2a85e5e1' };
}

// Builds OS-aware fix link for disk space
function diskFixLink(platform) {
  if (platform === 'darwin') {
    return { text: 'How to free up space on a Mac', url: 'https://support.apple.com/en-us/102613' };
  }
  if (platform === 'linux') {
    return { text: 'How to free up space on Linux', url: 'https://www.howtogeek.com/howto/ubuntu/cleaning-up-a-ubuntu-installation/' };
  }
  return { text: 'How to free up space on Windows', url: 'https://support.microsoft.com/en-us/windows/free-up-drive-space-in-windows-85529ccb-c365-490d-b548-831022bc9b32' };
}

// Builds OS-aware fix link for OS upgrade
function osFixLink(platform) {
  if (platform === 'darwin') {
    return { text: 'How to update macOS', url: 'https://support.apple.com/en-us/102665' };
  }
  if (platform === 'linux') {
    return { text: 'How to upgrade Ubuntu', url: 'https://ubuntu.com/tutorials/upgrading-ubuntu-desktop' };
  }
  return { text: 'How to update Windows', url: 'https://support.microsoft.com/en-us/windows/update-windows-3c5ae7fc-9fb6-9af1-1984-b5e0412c556a' };
}

/**
 * Evaluates detected specs and returns a structured verdict.
 *
 * @param {object} specs - Output from detectAll() in detection.js
 * @returns {object} { verdict, claudeCode, claudeCowork, specs: {...}, fixes: [...] }
 */
function evaluate(specs) {
  const platform = specs.os ? specs.os.platform : 'Unknown';

  // Score each spec
  const ram   = scoreRAM(specs.ram ? specs.ram.totalGB : 'Unknown');
  const disk  = scoreDisk(specs.disk ? specs.disk.freeGB : 'Unknown');
  const os    = scoreOS(specs.os || {});
  const cpu   = scoreCPU(specs.os ? specs.os.arch : 'Unknown');

  // Per-tool: a tool "fails" if any required check is 'fail'
  const codeChecks   = [ram.code, disk, os.code, cpu];
  const coworkChecks = [ram.cowork, disk, os.cowork, cpu];

  const codeHasFail   = codeChecks.includes('fail');
  const coworkHasFail = coworkChecks.includes('fail');
  const codeHasWarn   = codeChecks.includes('warn');
  const coworkHasWarn = coworkChecks.includes('warn');

  const claudeCode   = codeHasFail   ? 'fail' : codeHasWarn   ? 'warn' : 'pass';
  const claudeCowork = coworkHasFail ? 'fail' : coworkHasWarn ? 'warn' : 'pass';

  // Overall verdict
  let verdict;
  if (codeHasFail && coworkHasFail) {
    verdict = 'red';
  } else if (codeHasFail || coworkHasFail || codeHasWarn || coworkHasWarn) {
    verdict = 'yellow';
  } else {
    verdict = 'green';
  }

  // Per-spec display status (worst across both tools)
  const specStatus = {
    ram:  worst(ram.code, ram.cowork),
    disk: disk,
    os:   worst(os.code, os.cowork),
    cpu:  cpu,
  };

  // Build fixes list
  const fixes = [];

  if (specStatus.ram !== 'pass') {
    const needed = ram.cowork === 'fail' ? 16 : 8;
    fixes.push({
      id: 'ram',
      title: `Add more RAM (you have ${specs.ram.totalGB} GB, Claude Cowork needs ${needed} GB)`,
      body: `Your computer doesn't have enough memory${ram.cowork === 'warn' ? ' for Claude Cowork' : ''}. Adding more RAM is the most effective upgrade for AI tools.`,
      link: ramFixLink(platform),
    });
  }

  if (disk !== 'pass') {
    const freeVal = specs.disk.freeGB !== 'Unknown' ? `${specs.disk.freeGB} GB` : 'an unknown amount';
    fixes.push({
      id: 'disk',
      title: `Free up disk space (you have ${freeVal} free, 20 GB needed)`,
      body: `Both AI tools need at least 20 GB of free space to install and run. Deleting old files or unused apps is usually the quickest fix.`,
      link: diskFixLink(platform),
    });
  }

  if (specStatus.os !== 'pass') {
    fixes.push({
      id: 'os',
      title: `Update your operating system`,
      body: `Claude Code needs macOS 10.15+, Windows 10+, or a recent Linux. Claude Cowork also requires macOS 12+ or Windows 10+. Updating your OS is free and improves security too.`,
      link: osFixLink(platform),
    });
  }

  if (cpu !== 'pass') {
    fixes.push({
      id: 'cpu',
      title: `Your processor may not be supported`,
      body: `Both AI tools require a 64-bit processor. Very old computers (made before 2010) sometimes have 32-bit processors that can't run modern software.`,
      link: { text: 'What is a 64-bit processor?', url: 'https://support.microsoft.com/en-us/windows/32-bit-and-64-bit-windows-frequently-asked-questions-c6da59c4-ebb3-9c1b-7f45-c04ab28dca5d' },
    });
  }

  return {
    verdict,
    claudeCode,
    claudeCowork,
    specs: {
      ram:       { ...specStatus.ram !== undefined ? {} : {}, statusCode: ram.code, statusCowork: ram.cowork, displayStatus: specStatus.ram, totalGB: specs.ram ? specs.ram.totalGB : 'Unknown' },
      disk:      { displayStatus: disk, freeGB: specs.disk ? specs.disk.freeGB : 'Unknown', totalGB: specs.disk ? specs.disk.totalGB : 'Unknown' },
      os:        { statusCode: os.code, statusCowork: os.cowork, displayStatus: specStatus.os, platform: specs.os ? specs.os.platform : 'Unknown', distro: specs.os ? specs.os.distro : 'Unknown', release: specs.os ? specs.os.release : 'Unknown' },
      cpu:       { displayStatus: cpu, model: specs.cpu ? specs.cpu.model : 'Unknown', arch: specs.os ? specs.os.arch : 'Unknown' },
      ramLayout: { type: specs.ramLayout ? specs.ramLayout.type : 'Unknown', speedMHz: specs.ramLayout ? specs.ramLayout.speedMHz : 'Unknown' },
      gpu:       { model: specs.gpu ? specs.gpu.model : 'Unknown' },
    },
    fixes,
  };
}

module.exports = { evaluate };
