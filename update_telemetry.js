const fs = require('fs');

let content = fs.readFileSync('src/services/telemetry.js', 'utf8');

// Change localStorage to sessionStorage for queue storage according to instructions
content = content.replace(/localStorage\.getItem\('axim_telemetry_queue'\)/g, "sessionStorage.getItem('axim_telemetry_queue')");
content = content.replace(/localStorage\.setItem\('axim_telemetry_queue'/g, "sessionStorage.setItem('axim_telemetry_queue'");
content = content.replace(/localStorage\.removeItem\('axim_telemetry_queue'\)/g, "sessionStorage.removeItem('axim_telemetry_queue')");

fs.writeFileSync('src/services/telemetry.js', content, 'utf8');
