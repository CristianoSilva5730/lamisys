
#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const waitOn = require('wait-on');
const electronPath = require('electron');

const appPath = path.join(__dirname, '..');

console.log('Starting Electron development environment...');

// First start the Vite dev server
const viteProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: appPath
});

// Wait for the dev server to be ready
waitOn({
  resources: ['http-get://localhost:8080'],
  timeout: 30000 // 30 seconds timeout
})
  .then(() => {
    console.log('Vite dev server is ready, starting Electron...');
    
    // Start Electron with the dev configuration
    const electronProcess = spawn(electronPath, [path.join(appPath, 'src/electron.js')], {
      stdio: 'inherit',
      cwd: appPath
    });

    electronProcess.on('close', (code) => {
      console.log(`Electron process exited with code ${code}`);
      viteProcess.kill();
      process.exit(code);
    });

    // Handle Ctrl+C to properly close all processes
    process.on('SIGINT', () => {
      electronProcess.kill();
      viteProcess.kill();
      process.exit(0);
    });
  })
  .catch((err) => {
    console.error('Error waiting for dev server:', err);
    viteProcess.kill();
    process.exit(1);
  });
