
const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const express = require('express');

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

// Helper to detect LAN IP for production (fallback to localhost)
function getLocalUrl() {
  // Production is always at http://localhost:8080 or LAN IP.
  const PORT = 8080;
  // Optionally, detect actual LAN IP here if you want.
  return `http://localhost:${PORT}`;
}

// When ready
app.whenReady().then(() => {
  try {
    // Start backend server if available
    if (!isDev) {
      process.env.NODE_ENV = 'production';
    }
    startServer();
    
    createWindow();
  } catch (error) {
    console.error('Error initializing application:', error);
  }
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

const createWindow = () => {
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

  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    // Always launch from local express server (LAN-available)
    mainWindow.loadURL(getLocalUrl());
  }

  mainWindow.on('close', (e) => {
    if (isDev) {
      app.quit();
      return;
    }
    
    // Here we could ask the user if they really want to exit
    // For now, just close without asking
  });
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  console.log('Application shutting down...');
});
