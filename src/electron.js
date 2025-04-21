
const path = require('path');
const { app, BrowserWindow } = require('electron');
const isDev = require('electron-is-dev');

// Try to import the server conditionally to avoid errors
let startServer;
try {
  const server = require('./backend/server');
  startServer = server.startServer;
} catch (error) {
  console.error('Error importing server:', error);
  startServer = () => console.log('Server not initialized');
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/favicon.ico')
  });

  // Always load from http://localhost:8080
  const url = 'http://localhost:8080';
  
  mainWindow.loadURL(url);
  
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  try {
    console.log('Starting server...');
    startServer();
    
    console.log('Creating window...');
    createWindow();
  } catch (error) {
    console.error('Error starting application:', error);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
