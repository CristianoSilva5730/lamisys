
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

// Start the backend server first
const serverProcess = spawn('node', [path.join(appPath, 'src/backend/server.js')], {
  stdio: 'inherit',
  cwd: appPath
});

// Wait for the server to start
setTimeout(() => {
  console.log('Backend server should be ready, starting Electron...');
  
  // Start Electron with the main script
  const electronProcess = spawn(electronPath, [path.join(appPath, 'src/electron.js')], {
    stdio: 'inherit',
    cwd: appPath
  });

  electronProcess.on('close', (code) => {
    console.log(`Electron process exited with code ${code}`);
    serverProcess.kill();
    process.exit(code);
  });

  // Handle Ctrl+C to properly close all processes
  process.on('SIGINT', () => {
    electronProcess.kill();
    serverProcess.kill();
    process.exit(0);
  });
}, 2000); // Wait 2 seconds for server to start
