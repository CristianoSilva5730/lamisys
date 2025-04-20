
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

// Cria a janela principal
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/favicon.ico')
  });

  // Em desenvolvimento, carrega a URL local de desenvolvimento
  // Em produção, carrega o app com electron-serve
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    // Abrir o DevTools automaticamente em desenvolvimento
    mainWindow.webContents.openDevTools();
  } else {
    try {
      loadURL(mainWindow);
    } catch (error) {
      console.error('Erro ao carregar URL:', error);
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
  }

  // Impedir fechamento da janela em ações específicas
  mainWindow.on('close', (e) => {
    if (isDev) {
      app.quit();
      return;
    }
    
    // Aqui poderia perguntar ao usuário se deseja realmente sair
    // Por enquanto, apenas fecha sem perguntar
  });
};

// Quando o Electron estiver pronto
app.whenReady().then(() => {
  try {
    // Iniciar o servidor Express
    startServer();
    
    // Criar a janela principal
    createWindow();
  } catch (error) {
    console.error('Erro ao inicializar aplicação:', error);
  }

  // No macOS, é comum recriar uma janela quando o ícone do dock é clicado
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Sair quando todas as janelas são fechadas, exceto no macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Fechar adequadamente em macOS
app.on('before-quit', () => {
  // Aqui poderíamos realizar operações de limpeza antes de sair
  console.log('Aplicação encerrando...');
});
