// Smoke-check script: ensure assertNoArcGISError is referenced by both files
const fs = require('fs');
const path = require('path');
const files = [
    path.join(__dirname, '..', 'app', 'traverse.ts'),
    path.join(__dirname, '..', 'app', 'downloader.ts'),
];
let ok = true;
for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    if (!/assertNoArcGISError/.test(src)) {
        console.error(`${f} does not reference assertNoArcGISError`);
        ok = false;
    } else {
        console.log(`${f} references assertNoArcGISError`);
    }
}
if (ok) {
    console.log('SMOKE CHECK: OK');
    process.exit(0);
}
console.error('SMOKE CHECK: FAILED');
process.exit(2);
