const { contextBridge } = require('electron');

// API methods will be exposed here in Phase 7
// contextBridge.exposeInMainWorld('api', { ... });

contextBridge.exposeInMainWorld('api', {});
