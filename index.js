const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

function createWindow () {
  let win = new BrowserWindow({
    icon: path.join(__dirname, 'src/icons/icon.png'),
    width: 1000,
    height: 800,
    minHeight: 800,
    minWidth: 1000,
    webPreferences: {
        preload: path.join(__dirname, 'src/scripts/preload.js'),
        enableRemoteModule: true,
    }
  })

  win.loadFile('src/pages/main.html');
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})