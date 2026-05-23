const COPY = {
  verdict: {
    green: {
      title: "You're ready for AI work",
      detail: "Your machine has everything it needs to run both Claude Code and Claude Cowork smoothly.",
    },
    yellow: {
      title: function(n) {
        return 'Almost there — ' + n + ' thing' + (n !== 1 ? 's' : '') + ' to sort out';
      },
      detail: function(codeOk, coworkOk) {
        if (codeOk && !coworkOk)  return 'Claude Code will run fine on your machine. Claude Cowork needs a couple of things sorted first — see the fixes below.';
        if (!codeOk && coworkOk)  return 'Claude Cowork will run fine. Claude Code needs a couple of things sorted first — see the fixes below.';
        return 'Your machine needs some attention before the tools will run well — see the fixes below.';
      },
    },
    red: {
      title: "This machine isn't ready for AI work yet",
      detail: function(n) {
        return n + ' thing' + (n !== 1 ? 's' : '') + ' are blocking it. The good news — each fix is straightforward and we’ll walk you through it below.';
      },
    },
  },

  tool: {
    pass: 'Ready',
    warn: 'Almost ready',
    fail: 'Not ready',
  },

  spec: {
    ram: {
      pass: 'Plenty of memory',
      warn: 'Enough for Claude Code, not Cowork',
      fail: 'Not enough memory',
    },
    disk: {
      pass: 'Enough free space',
      warn: 'Getting low — free some space up',
      fail: 'Not enough free space',
    },
    os: {
      pass: 'Supported',
      fail: 'Needs an update to run AI tools',
    },
    cpu: {
      pass: 'Compatible',
      fail: 'May not be supported',
    },
    ramType: 'For your information only',
    gpu:     'Not needed — AI tools run in the cloud',
    unknown: 'We couldn’t detect this',
  },
};
