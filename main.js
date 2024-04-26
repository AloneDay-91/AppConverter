const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile('index.html');

    mainWindow.webContents.on('ipc-message', async (event, channel, ...args) => {
        if (channel === 'select-folder-input') {
            const result = await dialog.showOpenDialog(mainWindow, {
                properties: ['openDirectory'],
            });

            if (!result.canceled && result.filePaths.length > 0) {
                mainWindow.webContents.send('folder-input-selected', result.filePaths[0]);
            }
        }

        if (channel === 'select-folder-output') {
            const result = await dialog.showOpenDialog(mainWindow, {
                properties: ['openDirectory'],
            });

            if (!result.canceled && result.filePaths.length > 0) {
                mainWindow.webContents.send('folder-output-selected', result.filePaths[0]);
            }
        }
    });
};

app.whenReady().then(createWindow);

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
