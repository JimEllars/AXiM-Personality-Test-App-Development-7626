const fs = require('fs');
let code = fs.readFileSync('src/services/telemetry.js', 'utf8');

// The requirement: "Implement an exponential-backoff retry mechanism with a timeout capped at 2.5s."
// The old code: `setTimeout(() => attemptFetch(retries - 1), (4 - retries) * 1000); // exponential-ish backoff`
// We need to change this to actual exponential backoff with max 2.5s timeout.

const oldBackoff = /setTimeout\(\(\) => attemptFetch\(retries - 1\), \(4 - retries\) \* 1000\); \/\/ exponential-ish backoff/;
const newBackoff = `const delay = Math.min(2500, Math.pow(2, 3 - retries) * 500); // Exponential backoff capped at 2.5s
            setTimeout(() => attemptFetch(retries - 1), delay);`;

code = code.replace(oldBackoff, newBackoff);

fs.writeFileSync('src/services/telemetry.js', code);
