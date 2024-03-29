const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

function createWindow () {
  let win = new BrowserWindow({
    width: 1000,
    height: 707,
    minHeight: 707,
    minWidth: 1000,
    maxWidth: 1000,
    maxHeight: 707,
    webPreferences: {
        preload: path.join(__dirname, 'src/minscripts/preload.min.js'),
        enableRemoteModule: true,
    },
    icon: path.join(__dirname, 'src/icons/icon.png')
  })
  win.removeMenu();
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