
// Read the current package.json
const fs = require('fs');
const path = require('path');

// Read the current package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Update the scripts
packageJson.scripts = {
  ...packageJson.scripts,
  "dev": "vite",
  "build": "tsc && vite build",
  "build:dev": "vite build --mode development",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "preview": "vite preview",
  "electron:dev": "node src/electron-dev.js",
  "electron:start": "node src/electron-start.js",
  "start": "npm run build && node src/electron-start.js",
  "git:sync": "node src/git-sync.js",
  "git:push": "node src/git-sync.js push"
};

// Write the updated package.json
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('Updated package.json scripts successfully');
