// PHASE 4 preview switcher — replaced with real logic in Phase 7

const VERDICTS = {
  green: {
    cardClass: 'verdict-card verdict-green',
    iconClass:  'ti ti-circle-check verdict-icon',
    title:  "You're ready for AI work",
    detail: "Your machine has everything it needs to run both Claude Code and Claude Cowork smoothly.",
  },
  yellow: {
    cardClass: 'verdict-card verdict-yellow',
    iconClass:  'ti ti-alert-triangle verdict-icon',
    title:  "Almost there — 1 thing to sort out",
    detail: "Claude Code will run fine on your machine. Claude Cowork needs a bit more RAM to work smoothly — see the fix below.",
  },
  red: {
    cardClass: 'verdict-card verdict-red',
    iconClass:  'ti ti-alert-circle verdict-icon',
    title:  "This machine isn't ready for AI work yet",
    detail: "2 things are blocking it: not enough RAM, not enough disk space. The good news — each fix is straightforward and we'll walk you through it below.",
  },
};

// Wire preview buttons
document.getElementById('preview-green').addEventListener('click', () => setVerdict('green'));
document.getElementById('preview-yellow').addEventListener('click', () => setVerdict('yellow'));
document.getElementById('preview-red').addEventListener('click', () => setVerdict('red'));

function setVerdict(color) {
  const v      = VERDICTS[color];
  const card   = document.getElementById('verdict-card');
  const icon   = document.getElementById('verdict-icon');
  const title  = document.getElementById('verdict-title');
  const detail = document.getElementById('verdict-detail');

  if (!v || !card) return;
  card.className   = v.cardClass;
  icon.className   = v.iconClass;
  title.textContent  = v.title;
  detail.textContent = v.detail;
}
