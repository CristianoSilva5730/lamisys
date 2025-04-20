
// Preload script seguro para comunicação entre o Electron e o processo de renderização
const { contextBridge, ipcRenderer } = require('electron');

// API segura para expor funcionalidades do Electron ao processo de renderização
contextBridge.exposeInMainWorld('electronAPI', {
  // Exemplo de função exposta
  sendMessage: (channel, data) => {
    // Lista de canais permitidos para envio
    const validChannels = ['toMain', 'backup', 'smtp'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  // Função para receber respostas
  receive: (channel, func) => {
    // Lista de canais permitidos para recebimento
    const validChannels = ['fromMain', 'backup-response', 'smtp-response'];
    if (validChannels.includes(channel)) {
      // Remover listeners antigos para evitar duplicação
      ipcRenderer.removeAllListeners(channel);
      // Adicionar novo listener
      ipcRenderer.on(channel, (_, ...args) => func(...args));
    }
  }
});

// Informações sobre a versão
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});
