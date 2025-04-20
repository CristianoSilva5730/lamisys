
#!/usr/bin/env node

/**
 * This is a helper script to start the Electron app
 * Usage: node electron-start.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const electronPath = require('electron');

const appPath = path.join(__dirname, '..');

console.log('Starting Electron application...');
console.log('App path:', appPath);

// Check if the build directory exists
const distPath = path.join(appPath, 'dist');
if (!fs.existsSync(distPath)) {
  console.error('Error: Build directory not found!');
  console.error('Please run "npm run build" before starting the application.');
  process.exit(1);
}

// Run electron with the main script
const electronProcess = spawn(electronPath, [path.join(appPath, 'src/electron.js')], {
  stdio: 'inherit',
  cwd: appPath
});

electronProcess.on('close', (code) => {
  console.log(`Electron process exited with code ${code}`);
  process.exit(code);
});
