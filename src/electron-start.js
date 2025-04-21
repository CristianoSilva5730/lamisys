
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

// Start the Electron app directly
// The electron.js file will handle starting the server
const electronProcess = spawn(electronPath, [path.join(appPath, 'src/electron.js')], {
  stdio: 'inherit',
  cwd: appPath
});

electronProcess.on('close', (code) => {
  console.log(`Electron process exited with code ${code}`);
  process.exit(code);
});

// Handle Ctrl+C to properly close all processes
process.on('SIGINT', () => {
  electronProcess.kill();
  process.exit(0);
});
