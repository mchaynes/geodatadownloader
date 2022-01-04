// Fixes `ReferenceError: crypto is not defined` in @arcgis/core/core/uuid.js
global.crypto = require('crypto')