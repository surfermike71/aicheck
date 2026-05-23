// ── Helpers ────────────────────────────────────────────────────────────────

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function formatArch(arch) {
  if (!arch || arch === 'Unknown') return 'Unknown';
  const a = arch.toLowerCase();
  if (a === 'x64' || a === 'x86_64')       return '64-bit (Intel/AMD)';
  if (a === 'arm64' || a === 'aarch64')     return '64-bit (ARM)';
  if (a === 'x86' || a === 'ia32' || a === 'i386') return '32-bit';
  return arch;
}

const STATUS_ICONS = {
  pass:    'ti-check',
  warn:    'ti-alert-triangle',
  fail:    'ti-x',
  unknown: 'ti-help',
};

const VERDICT_ICONS = {
  green:  'ti-circle-check',
  yellow: 'ti-alert-triangle',
  red:    'ti-alert-circle',
};

// ── Loading / error states ─────────────────────────────────────────────────

function showLoading() {
  document.getElementById('verdict-card').className = 'verdict-card verdict-yellow';
  document.getElementById('verdict-icon').className = 'ti ti-refresh verdict-icon';
  setText('verdict-title',  'Scanning your computer…');
  setText('verdict-detail', 'This takes just a moment.');
}

function showError(msg) {
  document.getElementById('verdict-card').className = 'verdict-card verdict-red';
  document.getElementById('verdict-icon').className = 'ti ti-alert-circle verdict-icon';
  setText('verdict-title',  'Something went wrong');
  setText('verdict-detail', "We couldn't scan your machine. Error: " + msg);
}

// ── Verdict card ───────────────────────────────────────────────────────────

function renderVerdict(result) {
  const card   = document.getElementById('verdict-card');
  const icon   = document.getElementById('verdict-icon');
  const v      = result.verdict;
  const fixes  = result.fixes;

  card.className = 'verdict-card verdict-' + v;
  icon.className = 'ti ' + (VERDICT_ICONS[v] || 'ti-alert-triangle') + ' verdict-icon';

  if (v === 'green') {
    setText('verdict-title',  COPY.verdict.green.title);
    setText('verdict-detail', COPY.verdict.green.detail);
  } else if (v === 'yellow') {
    setText('verdict-title',  COPY.verdict.yellow.title(fixes.length));
    setText('verdict-detail', COPY.verdict.yellow.detail(
      result.claudeCode   !== 'fail',
      result.claudeCowork !== 'fail'
    ));
  } else {
    setText('verdict-title',  COPY.verdict.red.title);
    setText('verdict-detail', COPY.verdict.red.detail(fixes.length));
  }
}

// ── Tool readiness badges ──────────────────────────────────────────────────

function renderBadge(id, status) {
  const el = document.getElementById(id);
  if (!el) return;
  const icon = STATUS_ICONS[status] || 'ti-help';
  el.className   = 'tool-badge status-' + status;
  el.innerHTML   = '<i class="ti ' + icon + '"></i> ' + esc(COPY.tool[status] || status);
}

function renderTools(result) {
  renderBadge('badge-code',   result.claudeCode);
  renderBadge('badge-cowork', result.claudeCowork);
}

// ── Spec cards ─────────────────────────────────────────────────────────────

function setSpecStatus(id, status, text) {
  const el = document.getElementById(id);
  if (!el) return;
  const icon = STATUS_ICONS[status] || 'ti-help';
  el.className = 'spec-status status-' + status;
  el.innerHTML = '<i class="ti ' + icon + '"></i> ' + esc(text);
}

function renderSpecs(specs, result) {
  // Operating system
  const osDisplay = (specs.os.distro && specs.os.distro !== 'Unknown')
    ? specs.os.distro
    : (specs.os.platform || 'Unknown');
  setText('spec-os-value', osDisplay);
  if (osDisplay === 'Unknown') {
    setSpecStatus('spec-os-status', 'unknown', COPY.spec.unknown);
  } else {
    setSpecStatus('spec-os-status', result.specs.os.displayStatus,
      COPY.spec.os[result.specs.os.displayStatus] || COPY.spec.os.pass);
  }

  // RAM amount
  const ramVal = specs.ram.totalGB !== 'Unknown' ? specs.ram.totalGB + ' GB' : 'Unknown';
  setText('spec-ram-value', ramVal);
  if (specs.ram.totalGB === 'Unknown') {
    setSpecStatus('spec-ram-status', 'unknown', COPY.spec.unknown);
  } else {
    setSpecStatus('spec-ram-status', result.specs.ram.displayStatus,
      COPY.spec.ram[result.specs.ram.displayStatus] || COPY.spec.ram.pass);
  }

  // RAM type (display only — always unknown status)
  const ramType = (specs.ramLayout.type && specs.ramLayout.type !== 'Unknown')
    ? specs.ramLayout.type + (specs.ramLayout.speedMHz && specs.ramLayout.speedMHz !== 'Unknown'
        ? ' at ' + specs.ramLayout.speedMHz + ' MHz' : '')
    : 'Unknown';
  setText('spec-ramtype-value', ramType);
  setSpecStatus('spec-ramtype-status', 'unknown', COPY.spec.ramType);

  // Disk
  const diskFree  = specs.disk.freeGB  !== 'Unknown' ? specs.disk.freeGB  + ' GB' : 'Unknown';
  const diskTotal = specs.disk.totalGB !== 'Unknown' ? ' of ' + specs.disk.totalGB + ' GB' : '';
  setText('spec-disk-value', diskFree + ' free' + diskTotal);
  if (specs.disk.freeGB === 'Unknown') {
    setSpecStatus('spec-disk-status', 'unknown', COPY.spec.unknown);
  } else {
    setSpecStatus('spec-disk-status', result.specs.disk.displayStatus,
      COPY.spec.disk[result.specs.disk.displayStatus] || COPY.spec.disk.pass);
  }

  // CPU model
  const cpuDisplay = specs.cpu.model !== 'Unknown'
    ? specs.cpu.model + (specs.cpu.cores && specs.cpu.cores !== 'Unknown' ? ' · ' + specs.cpu.cores + ' cores' : '')
    : 'Unknown';
  setText('spec-cpu-value', cpuDisplay);
  if (specs.cpu.model === 'Unknown') {
    setSpecStatus('spec-cpu-status', 'unknown', COPY.spec.unknown);
  } else {
    setSpecStatus('spec-cpu-status', result.specs.cpu.displayStatus,
      COPY.spec.cpu[result.specs.cpu.displayStatus] || COPY.spec.cpu.pass);
  }

  // CPU architecture
  const archRaw     = specs.os.arch;
  const archDisplay = formatArch(archRaw);
  setText('spec-arch-value', archDisplay);
  if (!archRaw || archRaw === 'Unknown') {
    setSpecStatus('spec-arch-status', 'unknown', COPY.spec.unknown);
  } else {
    setSpecStatus('spec-arch-status', result.specs.cpu.displayStatus,
      COPY.spec.cpu[result.specs.cpu.displayStatus] || COPY.spec.cpu.pass);
  }

  // GPU (display only — always unknown status)
  setText('spec-gpu-value', specs.gpu.model !== 'Unknown' ? specs.gpu.model : 'Unknown');
  setSpecStatus('spec-gpu-status', 'unknown', COPY.spec.gpu);
}

// ── Fix section ────────────────────────────────────────────────────────────

function renderFixes(result) {
  const list = document.getElementById('fix-list');
  if (!list) return;

  list.innerHTML = result.fixes.map(function(fix, i) {
    const linkHtml = fix.link
      ? '<a class="fix-link" href="#" data-url="' + esc(fix.link.url) + '">'
        + '<i class="ti ti-external-link"></i> ' + esc(fix.link.text)
        + '</a>'
      : '';
    return '<li class="fix-item">'
      + '<div class="fix-header">'
        + '<span class="fix-number">' + (i + 1) + '</span>'
        + '<span class="fix-title">' + esc(fix.title) + '</span>'
      + '</div>'
      + '<p class="fix-body">' + esc(fix.body) + '</p>'
      + linkHtml
      + '</li>';
  }).join('');
}

// ── Requirements table ─────────────────────────────────────────────────────

function setTableCell(id, status, text) {
  const el = document.getElementById(id);
  if (!el) return;
  const icon = STATUS_ICONS[status] || 'ti-help';
  el.className = 'cell-' + (status === 'pass' ? 'pass' : status === 'warn' ? 'warn' : 'fail');
  el.innerHTML = '<i class="ti ' + icon + '"></i>' + esc(text);
}

function renderTable(result) {
  setTableCell('table-ram-code',   result.specs.ram.statusCode,    '8 GB minimum');
  setTableCell('table-ram-cowork', result.specs.ram.statusCowork,  '16 GB recommended');
  setTableCell('table-disk-code',  result.specs.disk.displayStatus, '20 GB');
  setTableCell('table-disk-cowork',result.specs.disk.displayStatus, '20 GB');
  setTableCell('table-os-code',    result.specs.os.statusCode,     'macOS 10.15+, Windows 10+, Linux');
  setTableCell('table-os-cowork',  result.specs.os.statusCowork,   'macOS 12+, Windows 10+');
  setTableCell('table-cpu-code',   result.specs.cpu.displayStatus, '64-bit');
  setTableCell('table-cpu-cowork', result.specs.cpu.displayStatus, '64-bit');
}

// ── Main render ────────────────────────────────────────────────────────────

function renderAll(specs, result) {
  document.getElementById('main-content').dataset.verdict = result.verdict;
  renderVerdict(result);
  renderTools(result);
  renderSpecs(specs, result);
  renderFixes(result);
  renderTable(result);
}

// ── Scan ───────────────────────────────────────────────────────────────────

async function runScan() {
  const btnRefresh = document.getElementById('btn-refresh');
  showLoading();
  if (btnRefresh) btnRefresh.disabled = true;

  try {
    const specs  = await window.api.getSpecs();
    const result = evaluate(specs);
    renderAll(specs, result);
    updateTimestamp();
  } catch (err) {
    showError(String(err));
  } finally {
    if (btnRefresh) btnRefresh.disabled = false;
  }
}

function updateTimestamp() {
  const el = document.getElementById('last-scanned');
  if (!el) return;
  const now  = new Date();
  el.textContent = 'Last scanned at ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Boot ───────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', function() {
  document.getElementById('btn-refresh').addEventListener('click', runScan);

  // Open external links in the system browser
  document.addEventListener('click', function(e) {
    const link = e.target.closest('.fix-link');
    if (link) {
      e.preventDefault();
      const url = link.dataset.url;
      if (url) window.api.openExternal(url);
    }
  });

  runScan();
});
