const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const serve = require('electron-serve');

// Importar o servidor de forma condicional para evitar erros
let startServer;
try {
  const server = require('./backend/server');
  startServer = server.startServer;
} catch (error) {
  console.error('Erro ao importar servidor:', error);
  startServer = () => console.log('Servidor não inicializado');
}

// Carregar app a partir do build em produção
const loadURL = serve({ directory: 'dist' });

let mainWindow;

// Helper to detect LAN IP for production (fallback to localhost)
function getLocalUrl() {
  // Production is always at http://localhost:8080 or LAN IP.
  const PORT = 8080;
  // Optionally, detect actual LAN IP here if you want.
  return `http://localhost:${PORT}`;
}

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
    
    // Aqui poderia perguntar ao usuário se deseja realmente sair
    // Por enquanto, apenas fecha sem perguntar
  });
};

// When ready
app.whenReady().then(() => {
  try {
    startServer();
    createWindow();
  } catch (error) {
    console.error('Erro ao inicializar aplicação:', error);
  }
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  console.log('Aplicação encerrando...');
});
