const { remote } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object

window.onload = () => {
    const closeBtn = document.getElementById('close');
    closeBtn.addEventListener('click', function (event) {
        event.preventDefault();
        const win = remote.getCurrentWindow();
        win.close();
    })
}